import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/infra/prisma";

export const RESERVATION_MINUTES = 15;
export const RESERVATION_MS = RESERVATION_MINUTES * 60 * 1000;

/** Pedidos criados até este instante já passaram do prazo de pagamento. */
export function cutoffFor(now: Date): Date {
    return new Date(now.getTime() - RESERVATION_MS);
}

/** Devolve ao carrinho os jogos (e o cupom) de pedidos que não vão ser pagos. */
async function restoreCarts(tx: Prisma.TransactionClient, orderIds: string[]) {
    const orders = await tx.order.findMany({
        where: { id: { in: orderIds } },
        orderBy: { id: "asc" },
        select: { userId: true, couponId: true, items: { select: { variantId: true } } },
    });

    for (const order of orders) {
        const cart = await tx.shoppingCart.upsert({
            where: { userId: order.userId },
            update: {},
            create: { userId: order.userId },
            select: { id: true, couponId: true },
        });
        await tx.shoppingCartItem.createMany({
            data: order.items.map(({ variantId }) => ({ cartId: cart.id, variantId })),
            skipDuplicates: true,
        });
        if (order.couponId && !cart.couponId) {
            await tx.shoppingCart.update({
                where: { id: cart.id },
                data: { couponId: order.couponId },
            });
        }
    }
}

/**
 * Desfaz a reserva de pedidos que acabaram de virar CANCELED: chaves de volta ao estoque,
 * itens cancelados e jogos de volta ao carrinho. O chamador muda o status do pedido antes.
 */
export async function releaseOrders(tx: Prisma.TransactionClient, orderIds: string[]) {
    await tx.key.updateMany({
        where: { status: "RESERVED", orderItem: { orderId: { in: orderIds } } },
        data: { status: "AVAILABLE", orderItemId: null },
    });
    await tx.orderItem.updateMany({
        where: { status: "PENDING", orderId: { in: orderIds } },
        data: { status: "CANCELED" },
    });
    await restoreCarts(tx, orderIds);
}

/** Cancela os pedidos PENDING vencidos de todos os usuários e devolve as chaves ao estoque. */
export async function expireStaleOrders(now: Date = new Date()): Promise<void> {
    const cutoff = cutoffFor(now);

    // Quase sempre não há nada vencido: evita abrir transação (e travar linhas) à toa.
    const anyStale = await prisma.order.findFirst({
        where: { status: "PENDING", createdAt: { lte: cutoff } },
        select: { id: true },
    });
    if (!anyStale) return;

    await prisma.$transaction(async (tx) => {
        // Trava os pedidos antes das chaves, na mesma ordem do payOrder, para não haver deadlock.
        // SKIP LOCKED: um pedido travado por um pagamento em andamento é resolvido pelo próprio payOrder.
        const stale = await tx.$queryRaw<{ id: string }[]>`
            SELECT id FROM "order"
            WHERE status = 'PENDING' AND created_at <= ${cutoff}
            ORDER BY id
            FOR UPDATE SKIP LOCKED`;
        if (stale.length === 0) return;

        const ids = stale.map((order) => order.id);
        await tx.order.updateMany({
            where: { id: { in: ids }, status: "PENDING" },
            data: { status: "CANCELED" },
        });
        await releaseOrders(tx, ids);
    });
}
