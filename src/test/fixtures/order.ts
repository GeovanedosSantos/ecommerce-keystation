import { randomUUID } from "node:crypto";
import { addToCart } from "@/core/modules/cart/cart.service";
import type { PaymentInput } from "@/core/modules/order/schema";
import { prisma } from "@/infra/prisma";
import { addKey, createGame, createPlatform } from "./catalog";

export const VALID_CPF = "52998224725";
export const OTHER_CPF = "11144477735";

export const pixPayment = (cpf = VALID_CPF): PaymentInput => ({ method: "pix", cpf });

export const createUser = (cpf?: string) =>
    prisma.user.create({
        data: {
            email: `${randomUUID()}@teste.com`,
            passwordHash: "hash",
            firstName: "Cliente",
            lastName: "Teste",
            cpf,
        },
    });

/** Cria um jogo na Steam com `keys` chaves e devolve o id da variant. */
export async function createStockedGame(title: string, price: number, keys = 1) {
    const platform = await createPlatform(`Plataforma ${randomUUID().slice(0, 8)}`);
    const game = await createGame({ title, variants: [{ platformId: platform.id, price }] });
    const variantId = game.variantId(platform.id);
    for (let index = 0; index < keys; index++) await addKey(variantId);
    return variantId;
}

export async function fillCart(userId: string, variantIds: string[]) {
    for (const variantId of variantIds) await addToCart(userId, variantId);
}

export const keyStatuses = async () =>
    (await prisma.key.findMany({ select: { status: true } })).map(({ status }) => status).sort();

/** Cria um pedido PENDING com uma chave reservada por jogo, pelo caminho real do checkout. */
export async function createPendingOrder(userId: string, variantIds: string[]) {
    const { createOrderFromCart } = await import("@/core/modules/order/order.service");
    await fillCart(userId, variantIds);
    const result = await createOrderFromCart(userId);
    if (!result.ok) throw new Error(`Checkout falhou: ${result.error}`);
    return result.orderId;
}
