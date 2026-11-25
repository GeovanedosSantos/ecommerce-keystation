import { randomInt } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/infra/prisma";
import { checkCouponUsage, getCart } from "@/core/modules/cart/cart.service";
import { toCents } from "@/core/modules/cart/pricing";
import { RESERVATION_MS, cutoffFor, expireStaleOrders, releaseOrders } from "./expiration";
import type { PaymentInput } from "./schema";

export { RESERVATION_MINUTES, expireStaleOrders } from "./expiration";

export type CreateOrderError = "EMPTY_CART" | "COUPON_INVALID" | "OUT_OF_STOCK";
export type CreateOrderResult =
    | { ok: true; orderId: string }
    | { ok: false; error: CreateOrderError; outOfStockTitles?: string[] };

export type PayOrderError =
    | "NOT_FOUND"
    | "NOT_PENDING"
    | "EXPIRED"
    | "CPF_MISMATCH"
    | "CPF_IN_USE"
    | "IDEMPOTENCY_KEY_REUSED";
export type PayOrderResult =
    | { ok: true; orderId: string; alreadyPaid: boolean }
    | { ok: false; error: PayOrderError };

export type CancelOrderResult = { ok: true } | { ok: false; error: "NOT_FOUND" | "NOT_PENDING" };

export type RevealKeyResult =
    | { ok: true; keyCode: string }
    | { ok: false; error: "NOT_FOUND" | "NOT_SOLD" };

export type OrderView = {
    id: string;
    number: string;
    status: "PENDING" | "PAID" | "CANCELED" | "FAILED" | "PROCESSING" | "REFUNDED";
    expiresAt: Date;
    isExpired: boolean;
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    couponCode: string | null;
    userCpf: string | null;
    items: { id: string; title: string; paidPriceCents: number; originalPriceCents: number }[];
};

/** Erro interno: desfaz a transação do checkout quando falta chave. */
class OutOfStockError extends Error {
    constructor(readonly titles: string[]) {
        super("OUT_OF_STOCK");
    }
}

const UNIQUE_COLUMNS = {
    order_number_key: "number",
    payment_idempotency_key_key: "idempotency_key",
    user_cpf_key: "cpf",
} as const;

type UniqueConstraint = keyof typeof UNIQUE_COLUMNS;

/**
 * Reconhece o P2002 de uma constraint. Com o @prisma/adapter-pg o nome do índice vem em
 * `driverAdapterError.cause.constraint.index`; `meta.target` cobre outros formatos (nome ou colunas).
 */
function isUniqueViolation(error: unknown, constraint: UniqueConstraint): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        return false;
    }
    const meta = error.meta as
        | {
              driverAdapterError?: { cause?: { constraint?: { index?: string } } };
              target?: string | string[];
          }
        | undefined;
    if (meta?.driverAdapterError?.cause?.constraint?.index === constraint) return true;

    const targets = [meta?.target ?? []].flat();
    return targets.includes(constraint) || targets.includes(UNIQUE_COLUMNS[constraint]);
}

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

/** Data no fuso de Brasília (YYYYMMDD): um pedido às 22h não sai com a data do dia seguinte. */
const orderDateFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

function generateOrderNumber(now: Date): string {
    const date = orderDateFormat.format(now).replaceAll("-", "");
    const suffix = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomInt(32)]);
    return `KS-${date}-${suffix.join("")}`;
}

export async function createOrderFromCart(
    userId: string,
    now: Date = new Date(),
): Promise<CreateOrderResult> {
    await expireStaleOrders(now);

    for (let attempt = 1; ; attempt++) {
        try {
            return await placeOrder(userId, now);
        } catch (error) {
            if (error instanceof OutOfStockError) {
                return { ok: false, error: "OUT_OF_STOCK", outOfStockTitles: error.titles };
            }
            // Número do pedido sorteado repetido: a transação foi desfeita, então basta tentar de novo.
            if (isUniqueViolation(error, "order_number_key") && attempt < MAX_ORDER_NUMBER_ATTEMPTS) {
                continue;
            }
            throw error;
        }
    }
}

async function placeOrder(userId: string, now: Date): Promise<CreateOrderResult> {
    return prisma.$transaction(async (tx): Promise<CreateOrderResult> => {
        // Dois cliques em "Confirmar pedido": o segundo espera aqui e encontra o carrinho vazio.
        const [lockedCart] = await tx.$queryRaw<{ coupon_id: string | null }[]>`
            SELECT coupon_id FROM shopping_cart WHERE user_id = ${userId}::uuid FOR UPDATE`;

        const cart = await getCart(userId, tx, now);
        if (cart.items.length === 0) return { ok: false, error: "EMPTY_CART" };

        // O carrinho tinha um cupom que o getCart descartou (venceu, foi desativado, valor mínimo):
        // não segue com o preço cheio sem avisar. Remove o cupom e pede a confirmação de novo.
        const dropCoupon = async (): Promise<CreateOrderResult> => {
            await tx.shoppingCart.updateMany({ where: { userId }, data: { couponId: null } });
            return { ok: false, error: "COUPON_INVALID" };
        };
        if (lockedCart?.coupon_id && !cart.coupon) return dropCoupon();

        let coupon: { id: string; code: string } | null = null;
        if (cart.coupon) {
            const found = await tx.coupon.findUnique({ where: { code: cart.coupon.code } });
            // Trava o cupom: dois checkouts simultâneos contam os usos um depois do outro.
            if (found) await tx.$queryRaw`SELECT id FROM coupon WHERE id = ${found.id}::uuid FOR UPDATE`;
            if (!found || (await checkCouponUsage(found, userId, tx))) return dropCoupon();
            coupon = { id: found.id, code: found.code };
        }

        const { subtotalCents, discountCents, totalCents } = cart.totals;
        const order = await tx.order.create({
            data: {
                number: generateOrderNumber(now),
                userId,
                subtotal: subtotalCents / 100,
                discountAmount: discountCents / 100,
                total: totalCents / 100,
                couponId: coupon?.id ?? null,
                couponCode: coupon?.code ?? null,
                createdAt: now,
            },
            select: { id: true },
        });

        const soldOut: string[] = [];
        for (const item of cart.items) {
            const orderItem = await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    variantId: item.variantId,
                    originalPrice: item.originalPriceCents / 100,
                    paidPrice: item.priceCents / 100,
                },
                select: { id: true },
            });

            const reserved = await tx.$queryRaw<{ id: string }[]>`
                UPDATE "key" SET status = 'RESERVED', order_item_id = ${orderItem.id}::uuid
                WHERE id = (
                    SELECT k.id FROM "key" k
                    JOIN product_variant pv ON pv.id = k.variant_id
                    WHERE k.variant_id = ${item.variantId}::uuid
                      AND k.status = 'AVAILABLE'
                      AND pv.status = 'PUBLISHED'
                    LIMIT 1
                    FOR UPDATE OF k SKIP LOCKED
                )
                RETURNING id`;
            if (reserved.length === 0) soldOut.push(item.title);
        }
        if (soldOut.length > 0) throw new OutOfStockError(soldOut);

        await tx.shoppingCartItem.deleteMany({ where: { cart: { userId } } });
        await tx.shoppingCart.updateMany({ where: { userId }, data: { couponId: null } });

        return { ok: true, orderId: order.id };
    });
}

/** Tela de pagamento: antes de ler, cancela o que venceu para o pedido não aparecer como pendente. */
export async function getOrderForPayment(
    userId: string,
    orderId: string,
    now: Date = new Date(),
): Promise<OrderView | null> {
    await expireStaleOrders(now);
    return getOrder(userId, orderId, now);
}

/** Leitura simples, sem varrer pedidos vencidos. */
export async function getOrder(
    userId: string,
    orderId: string,
    now: Date = new Date(),
): Promise<OrderView | null> {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
            user: { select: { cpf: true } },
            items: {
                orderBy: { id: "asc" },
                include: { variant: { include: { product: { select: { title: true } } } } },
            },
        },
    });
    if (!order) return null;

    const expiresAt = new Date(order.createdAt.getTime() + RESERVATION_MS);
    return {
        id: order.id,
        number: order.number,
        status: order.status,
        expiresAt,
        isExpired: order.status === "PENDING" && expiresAt <= now,
        subtotalCents: toCents(order.subtotal),
        discountCents: toCents(order.discountAmount),
        totalCents: toCents(order.total),
        couponCode: order.couponCode,
        userCpf: order.user.cpf,
        items: order.items.map((item) => ({
            id: item.id,
            title: item.variant.product.title,
            paidPriceCents: toCents(item.paidPrice),
            originalPriceCents: toCents(item.originalPrice),
        })),
    };
}

async function findPaymentByKey(idempotencyKey: string) {
    return prisma.payment.findUnique({
        where: { idempotencyKey },
        select: { orderId: true, order: { select: { userId: true } } },
    });
}

async function resolveKnownKey(
    userId: string,
    orderId: string,
    idempotencyKey: string,
): Promise<PayOrderResult | null> {
    const existing = await findPaymentByKey(idempotencyKey);
    if (!existing) return null;
    if (existing.orderId === orderId && existing.order.userId === userId) {
        return { ok: true, orderId, alreadyPaid: true };
    }
    return { ok: false, error: "IDEMPOTENCY_KEY_REUSED" };
}

export async function payOrder(
    userId: string,
    orderId: string,
    idempotencyKey: string,
    input: PaymentInput,
    now: Date = new Date(),
): Promise<PayOrderResult> {
    const known = await resolveKnownKey(userId, orderId, idempotencyKey);
    if (known) return known;

    try {
        return await prisma.$transaction(async (tx): Promise<PayOrderResult> => {
            // Um segundo pagamento do mesmo pedido espera aqui e depois enxerga o pedido já PAID.
            const locked = await tx.$queryRaw<{ id: string; status: string; created_at: Date }[]>`
                SELECT id, status, created_at FROM "order"
                WHERE id = ${orderId}::uuid AND user_id = ${userId}::uuid
                FOR UPDATE`;
            const order = locked[0];
            if (!order) return { ok: false, error: "NOT_FOUND" };

            if (order.status === "PAID") return { ok: true, orderId, alreadyPaid: true };
            if (order.status !== "PENDING") return { ok: false, error: "NOT_PENDING" };

            if (order.created_at <= cutoffFor(now)) {
                await tx.order.updateMany({
                    where: { id: orderId, status: "PENDING" },
                    data: { status: "CANCELED" },
                });
                await releaseOrders(tx, [orderId]);
                return { ok: false, error: "EXPIRED" };
            }

            const user = await tx.user.findUniqueOrThrow({
                where: { id: userId },
                select: { cpf: true },
            });
            if (user.cpf === null) {
                const owner = await tx.user.findFirst({
                    where: { cpf: input.cpf, id: { not: userId } },
                    select: { id: true },
                });
                if (owner) return { ok: false, error: "CPF_IN_USE" };
                await tx.user.update({ where: { id: userId }, data: { cpf: input.cpf } });
            } else if (user.cpf !== input.cpf) {
                return { ok: false, error: "CPF_MISMATCH" };
            }

            const paid = await tx.order.updateMany({
                where: { id: orderId, status: "PENDING" },
                data: { status: "PAID", paidAt: now },
            });
            if (paid.count === 0) return { ok: false, error: "NOT_PENDING" };

            const sold = await tx.key.updateMany({
                where: { status: "RESERVED", orderItem: { orderId } },
                data: { status: "SOLD", soldAt: now },
            });
            const delivered = await tx.orderItem.updateMany({
                where: { orderId, status: "PENDING" },
                data: { status: "DELIVERED" },
            });
            // Cada item tem uma chave reservada. Se faltar alguma, desfaz tudo em vez de cobrar sem entregar.
            if (sold.count !== delivered.count) {
                throw new Error(`Pedido ${orderId}: ${delivered.count} itens, mas ${sold.count} chaves reservadas`);
            }

            const { total } = await tx.order.findUniqueOrThrow({
                where: { id: orderId },
                select: { total: true },
            });
            await tx.payment.create({
                data: {
                    orderId,
                    status: "SUCCEEDED",
                    amount: total,
                    method: input.method,
                    paidAt: now,
                    idempotencyKey,
                },
            });

            return { ok: true, orderId, alreadyPaid: false };
        });
    } catch (error) {
        // Corrida que escapou das travas: a transação foi desfeita, então só relemos o Payment.
        if (isUniqueViolation(error, "payment_idempotency_key_key")) {
            const known = await resolveKnownKey(userId, orderId, idempotencyKey);
            if (known) return known;
        }
        if (isUniqueViolation(error, "user_cpf_key")) return { ok: false, error: "CPF_IN_USE" };
        throw error;
    }
}

export async function cancelOrder(userId: string, orderId: string): Promise<CancelOrderResult> {
    return prisma.$transaction(async (tx): Promise<CancelOrderResult> => {
        const canceled = await tx.order.updateMany({
            where: { id: orderId, userId, status: "PENDING" },
            data: { status: "CANCELED" },
        });

        if (canceled.count === 0) {
            const exists = await tx.order.findFirst({
                where: { id: orderId, userId },
                select: { id: true },
            });
            return { ok: false, error: exists ? "NOT_PENDING" : "NOT_FOUND" };
        }

        await releaseOrders(tx, [orderId]);
        return { ok: true };
    });
}

export async function revealKey(userId: string, keyId: string): Promise<RevealKeyResult> {
    const owned = { id: keyId, orderItem: { order: { userId } } };

    await prisma.key.updateMany({
        where: { ...owned, status: "SOLD" },
        data: { status: "REVEALED", revealedAt: new Date() },
    });

    const key = await prisma.key.findFirst({
        where: owned,
        select: { status: true, keyCode: true },
    });
    if (!key) return { ok: false, error: "NOT_FOUND" };
    if (key.status !== "REVEALED") return { ok: false, error: "NOT_SOLD" };
    return { ok: true, keyCode: key.keyCode };
}

/** Pedido PENDING mais recente e ainda dentro do prazo, para retomar o pagamento. */
export async function findLatestPendingOrderId(
    userId: string,
    now: Date = new Date(),
): Promise<string | null> {
    const order = await prisma.order.findFirst({
        where: { userId, status: "PENDING", createdAt: { gt: cutoffFor(now) } },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });
    return order?.id ?? null;
}
