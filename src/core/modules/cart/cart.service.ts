import { prisma } from "@/infra/prisma";
import {
  calculateTotals,
  effectivePriceCents,
  toCents,
  type CartTotals,
  type CouponDiscount,
} from "./pricing";

export type CartItemView = {
  productId: string;
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
export type AddToCartResult =
  | { ok: true }
  | { ok: false; error: "PRODUCT_UNAVAILABLE" };

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
  return (
    promotion.isActive && promotion.startsAt <= now && promotion.endsAt >= now
  );
}

function checkCouponRules(
  coupon: CouponRules,
  subtotalCents: number,
  now: Date,
): CouponError | null {
  if (!coupon.isActive) return "INACTIVE";
  if (coupon.startsAt && coupon.startsAt > now) return "NOT_STARTED";
  if (coupon.endsAt && coupon.endsAt < now) return "EXPIRED";
  if (
    coupon.minOrderAmount &&
    subtotalCents < toCents(coupon.minOrderAmount)
  ) {
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

export async function getCart(userId: string): Promise<CartView> {
  const now = new Date();

  const cart = await prisma.shoppingCart.findUnique({
    where: { userId },
    include: {
      coupon: true,
      items: {
        orderBy: { addedAt: "asc" },
        include: {
          product: {
            include: {
              item: { select: { title: true, slug: true, coverPath: true } },
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

  const items: CartItemView[] = cart.items.map(({ product }) => {
    const originalPriceCents = toCents(product.price);
    const promoPercents = product.promotions
      .filter((link) => isPromotionActive(link.promotion, now))
      .map((link) => link.discountPercent);

    return {
      productId: product.id,
      title: product.item.title,
      slug: product.item.slug,
      coverPath: product.item.coverPath,
      originalPriceCents,
      priceCents: effectivePriceCents(originalPriceCents, promoPercents),
    };
  });

  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
  const couponIsValid =
    cart.coupon !== null &&
    checkCouponRules(cart.coupon, subtotalCents, now) === null;

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

export async function addToCart(
  userId: string,
  productId: string,
): Promise<AddToCartResult> {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "PRODUCT_UNAVAILABLE" };

  const cart = await prisma.shoppingCart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  await prisma.shoppingCartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: {},
    create: { cartId: cart.id, productId },
  });

  return { ok: true };
}

export async function removeFromCart(
  userId: string,
  productId: string,
): Promise<void> {
  await prisma.shoppingCartItem.deleteMany({
    where: { productId, cart: { userId } },
  });
}

export async function applyCoupon(
  userId: string,
  rawCode: string,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, error: "NOT_FOUND" };

  const cart = await getCart(userId);
  if (cart.items.length === 0) return { ok: false, error: "EMPTY_CART" };

  const rulesError = checkCouponRules(
    coupon,
    cart.totals.subtotalCents,
    new Date(),
  );
  if (rulesError) return { ok: false, error: rulesError };

  const countedStatuses = { notIn: ["FAILED", "CANCELED"] } as const;

  if (coupon.maxUses !== null) {
    const used = await prisma.order.count({
      where: { couponId: coupon.id, status: { notIn: [...countedStatuses.notIn] } },
    });
    if (used >= coupon.maxUses) return { ok: false, error: "MAX_USES" };
  }

  if (coupon.maxUsesPerUser !== null) {
    const usedByUser = await prisma.order.count({
      where: {
        couponId: coupon.id,
        userId,
        status: { notIn: [...countedStatuses.notIn] },
      },
    });
    if (usedByUser >= coupon.maxUsesPerUser) {
      return { ok: false, error: "MAX_USES_PER_USER" };
    }
  }

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