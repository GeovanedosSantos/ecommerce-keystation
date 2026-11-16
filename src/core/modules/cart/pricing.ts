export type CouponDiscount =
  | { type: "PERCENTAGE"; percent: number }
  | { type: "FIXED_AMOUNT"; amountCents: number };

export type CartTotals = {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

export function toCents(value: string | number | { toString(): string }): number {
  return Math.round(Number(value.toString()) * 100);
}

export function applyPercentDiscount(
  priceCents: number,
  percent: number,
): number {
  return Math.round((priceCents * (100 - percent)) / 100);
}

export function effectivePriceCents(
  priceCents: number,
  promoPercents: number[],
): number {
  const bestPercent = promoPercents.length ? Math.max(...promoPercents) : 0;
  return bestPercent > 0
    ? applyPercentDiscount(priceCents, bestPercent)
    : priceCents;
}

export function calculateCouponDiscount(
  subtotalCents: number,
  coupon: CouponDiscount,
): number {
  const raw =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotalCents * coupon.percent) / 100)
      : coupon.amountCents;

  return Math.min(Math.max(raw, 0), subtotalCents);
}

export function calculateTotals(
  itemPricesCents: number[],
  coupon: CouponDiscount | null,
): CartTotals {
  const subtotalCents = itemPricesCents.reduce((sum, price) => sum + price, 0);
  const discountCents = coupon
    ? calculateCouponDiscount(subtotalCents, coupon)
    : 0;

  return {
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}