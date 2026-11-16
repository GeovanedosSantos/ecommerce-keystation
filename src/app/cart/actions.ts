"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addToCart,
  applyCoupon,
  removeCoupon,
  removeFromCart,
  type CouponError,
} from "@/core/modules/cart/cart.service";
import { getSession } from "@/infra/session-cookie";

export type CartActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type CouponFormState = {
  error?: string;
  appliedCode?: string;
};

const productIdSchema = z.uuid();

const couponCodeSchema = z
  .string()
  .trim()
  .min(1, "Informe o código do cupom.")
  .max(50, "Código muito longo.");

const COUPON_MESSAGES: Record<CouponError, string> = {
  NOT_FOUND: "Cupom não encontrado.",
  EMPTY_CART: "Adicione um jogo ao carrinho antes de usar um cupom.",
  INACTIVE: "Este cupom não está ativo.",
  NOT_STARTED: "Este cupom ainda não está válido.",
  EXPIRED: "Este cupom expirou.",
  MIN_ORDER: "O valor do carrinho não atinge o mínimo para este cupom.",
  MAX_USES: "Este cupom atingiu o limite de usos.",
  MAX_USES_PER_USER: "Você já usou este cupom o máximo de vezes permitido.",
};

async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.userId;
}

function refreshCartViews(): void {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function addToCartAction(
  productId: string,
): Promise<CartActionResult> {
  const userId = await requireUserId();

  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { ok: false, message: "Produto inválido." };

  const result = await addToCart(userId, parsed.data);
  if (!result.ok) {
    return { ok: false, message: "Este produto não está disponível." };
  }

  refreshCartViews();
  return { ok: true };
}

export async function removeFromCartAction(productId: string): Promise<void> {
  const userId = await requireUserId();

  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return;

  await removeFromCart(userId, parsed.data);
  refreshCartViews();
}

export async function applyCouponAction(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const userId = await requireUserId();

  const parsed = couponCodeSchema.safeParse(String(formData.get("code") ?? ""));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Cupom inválido." };
  }

  const result = await applyCoupon(userId, parsed.data);
  if (!result.ok) return { error: COUPON_MESSAGES[result.error] };

  refreshCartViews();
  return { appliedCode: parsed.data.toUpperCase() };
}

export async function removeCouponAction(): Promise<void> {
  const userId = await requireUserId();
  await removeCoupon(userId);
  refreshCartViews();
}