import type { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import { expireStaleOrders } from "@/core/modules/order/expiration";
import {
    calculateTotals,
    effectivePriceCents,
    toCents,
    type CartTotals,
    type CouponDiscount,
} from "./pricing";

export type CartItemView = {
    variantId: string;
    title: string;
    slug: string;
    coverPath: string | null;
    originalPriceCents: number;
    priceCents: number;
};

export type CartView = {
    items: CartItemView[];
    coupon: { code: string } | null;
    totals: CartTotals;
};

export type CouponError =
    | "NOT_FOUND"
    | "EMPTY_CART"
    | "INACTIVE"
    | "NOT_STARTED"
    | "EXPIRED"
    | "MIN_ORDER"
    | "MAX_USES"
    | "MAX_USES_PER_USER";

export type CouponResult = { ok: true } | { ok: false; error: CouponError };
export type AddToCartError = "PRODUCT_UNAVAILABLE" | "OUT_OF_STOCK";
export type AddToCartResult = { ok: true } | { ok: false; error: AddToCartError };

type CouponRules = {
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    minOrderAmount: { toString(): string } | null;
};

function isPromotionActive(
    promotion: { isActive: boolean; startsAt: Date; endsAt: Date },
    now: Date,
): boolean {
    return promotion.isActive && promotion.startsAt <= now && promotion.endsAt >= now;
}

function checkCouponRules(
    coupon: CouponRules,
    subtotalCents: number,
    now: Date,
): CouponError | null {
    if (!coupon.isActive) return "INACTIVE";
    if (coupon.startsAt && coupon.startsAt > now) return "NOT_STARTED";
    if (coupon.endsAt && coupon.endsAt < now) return "EXPIRED";
    if (coupon.minOrderAmount && subtotalCents < toCents(coupon.minOrderAmount)) {
        return "MIN_ORDER";
    }
    return null;
}

function toCouponDiscount(coupon: {
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: { toString(): string };
}): CouponDiscount {
    return coupon.discountType === "PERCENTAGE"
        ? { type: "PERCENTAGE", percent: Number(coupon.discountValue.toString()) }
        : { type: "FIXED_AMOUNT", amountCents: toCents(coupon.discountValue) };
}

export async function getCart(
    userId: string,
    db: Prisma.TransactionClient = prisma,
    now: Date = new Date(),
): Promise<CartView> {

    const cart = await db.shoppingCart.findUnique({
        where: { userId },
        include: {
            coupon: true,
            items: {
                orderBy: { addedAt: "asc" },
                include: {
                    variant: {
                        include: {
                            product: { select: { title: true, slug: true, coverPath: true } },
                            promotions: { include: { promotion: true } },
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        return { items: [], coupon: null, totals: calculateTotals([], null) };
    }

    const items: CartItemView[] = cart.items.map(({ variant }) => {
        const originalPriceCents = toCents(variant.price);
        const promoPercents = variant.promotions
            .filter((link) => isPromotionActive(link.promotion, now))
            .map((link) => link.discountPercent);

        return {
            variantId: variant.id,
            title: variant.product.title,
            slug: variant.product.slug,
            coverPath: variant.product.coverPath,
            originalPriceCents,
            priceCents: effectivePriceCents(originalPriceCents, promoPercents),
        };
    });

    const subtotalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
    const couponIsValid =
        cart.coupon !== null && checkCouponRules(cart.coupon, subtotalCents, now) === null;

    const totals = calculateTotals(
        items.map((item) => item.priceCents),
        couponIsValid && cart.coupon ? toCouponDiscount(cart.coupon) : null,
    );

    return {
        items,
        coupon: couponIsValid && cart.coupon ? { code: cart.coupon.code } : null,
        totals,
    };
}

export async function addToCart(userId: string, variantId: string): Promise<AddToCartResult> {
    // Reservas vencidas seguram chaves: libera antes de olhar o estoque.
    await expireStaleOrders();
    const variant = await prisma.productVariant.findFirst({
        where: { id: variantId, status: "PUBLISHED" },
        select: { keys: { where: { status: "AVAILABLE" }, take: 1, select: { id: true } } },
    });
    if (!variant) return { ok: false, error: "PRODUCT_UNAVAILABLE" };
    // Sem chave disponível não há o que vender. O botão some no card, mas a action pode ser chamada direto.
    if (variant.keys.length === 0) return { ok: false, error: "OUT_OF_STOCK" };

    const cart = await prisma.shoppingCart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        select: { id: true },
    });

    await prisma.shoppingCartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        update: {},
        create: { cartId: cart.id, variantId },
    });

    return { ok: true };
}

export async function removeFromCart(userId: string, variantId: string): Promise<void> {
    await prisma.shoppingCartItem.deleteMany({
        where: { variantId, cart: { userId } },
    });
}

/** Pedidos FAILED/CANCELED não consomem o limite de usos do cupom. */
export async function checkCouponUsage(
    coupon: { id: string; maxUses: number | null; maxUsesPerUser: number | null },
    userId: string,
    db: Prisma.TransactionClient = prisma,
): Promise<"MAX_USES" | "MAX_USES_PER_USER" | null> {
    const status = { notIn: ["FAILED", "CANCELED"] satisfies OrderStatus[] };

    if (coupon.maxUses !== null) {
        const used = await db.order.count({ where: { couponId: coupon.id, status } });
        if (used >= coupon.maxUses) return "MAX_USES";
    }

    if (coupon.maxUsesPerUser !== null) {
        const usedByUser = await db.order.count({
            where: { couponId: coupon.id, userId, status },
        });
        if (usedByUser >= coupon.maxUsesPerUser) return "MAX_USES_PER_USER";
    }

    return null;
}

export async function applyCoupon(userId: string, rawCode: string): Promise<CouponResult> {
    const code = rawCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) return { ok: false, error: "NOT_FOUND" };

    const cart = await getCart(userId);
    if (cart.items.length === 0) return { ok: false, error: "EMPTY_CART" };

    const rulesError = checkCouponRules(coupon, cart.totals.subtotalCents, new Date());
    if (rulesError) return { ok: false, error: rulesError };

    const usageError = await checkCouponUsage(coupon, userId);
    if (usageError) return { ok: false, error: usageError };

    await prisma.shoppingCart.update({
        where: { userId },
        data: { couponId: coupon.id },
    });

    return { ok: true };
}

export async function removeCoupon(userId: string): Promise<void> {
    await prisma.shoppingCart.updateMany({
        where: { userId },
        data: { couponId: null },
    });
}

/** Variants no carrinho do usuário. Cada uma entra uma vez só (chave carrinho + variant). */
export async function getCartVariantIds(userId: string): Promise<string[]> {
    const items = await prisma.shoppingCartItem.findMany({
        where: { cart: { userId } },
        select: { variantId: true },
    });
    return items.map(({ variantId }) => variantId);
}

export async function getCartItemCount(userId: string): Promise<number> {
    return prisma.shoppingCartItem.count({ where: { cart: { userId } } });
}
