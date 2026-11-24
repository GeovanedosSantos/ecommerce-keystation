import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { addKey, createGame, createPlatform } from "@/test/fixtures/catalog";
import { addToCart, getCartVariantIds, removeFromCart } from "./cart.service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const createUser = () =>
    prisma.user.create({
        data: {
            email: `${randomUUID()}@teste.com`,
            passwordHash: "hash",
            firstName: "Cliente",
            lastName: "Teste",
        },
    });

async function seedVariants() {
    const [steam, xbox] = await Promise.all([createPlatform("Steam"), createPlatform("Xbox")]);
    const game = await createGame({
        title: "Hades",
        variants: [
            { platformId: steam.id, price: 50 },
            { platformId: xbox.id, price: 60 },
        ],
    });
    const steamId = game.variantId(steam.id);
    const xboxId = game.variantId(xbox.id);
    await Promise.all([addKey(steamId), addKey(xboxId)]);
    return { steamId, xboxId };
}

const cartItemCount = () => prisma.shoppingCartItem.count();

describe("addToCart", () => {
    it("adiciona uma variant publicada com chave disponível", async () => {
        const user = await createUser();
        const { steamId } = await seedVariants();

        expect(await addToCart(user.id, steamId)).toEqual({ ok: true });
        expect(await getCartVariantIds(user.id)).toEqual([steamId]);
    });

    it("recusa uma variant esgotada e não grava nada", async () => {
        const user = await createUser();
        const steam = await createPlatform("Steam");
        const game = await createGame({
            title: "Sem Chave",
            variants: [{ platformId: steam.id, price: 50 }],
        });

        const result = await addToCart(user.id, game.variantId(steam.id));

        expect(result).toEqual({ ok: false, error: "OUT_OF_STOCK" });
        expect(await cartItemCount()).toBe(0);
    });

    it("recusa uma variant cujas chaves já foram vendidas", async () => {
        const user = await createUser();
        const { steamId } = await seedVariants();
        await prisma.key.updateMany({ where: { variantId: steamId }, data: { status: "SOLD" } });

        expect(await addToCart(user.id, steamId)).toEqual({ ok: false, error: "OUT_OF_STOCK" });
        expect(await cartItemCount()).toBe(0);
    });

    it("recusa uma variant despublicada", async () => {
        const user = await createUser();
        const { steamId } = await seedVariants();
        await prisma.productVariant.update({
            where: { id: steamId },
            data: { status: "DISABLED" },
        });

        expect(await addToCart(user.id, steamId)).toEqual({
            ok: false,
            error: "PRODUCT_UNAVAILABLE",
        });
        expect(await cartItemCount()).toBe(0);
    });

    it("recusa uma variant que não existe", async () => {
        const user = await createUser();

        expect(await addToCart(user.id, randomUUID())).toEqual({
            ok: false,
            error: "PRODUCT_UNAVAILABLE",
        });
        expect(await cartItemCount()).toBe(0);
    });
});

describe("getCartVariantIds", () => {
    it("sem carrinho, devolve uma lista vazia", async () => {
        const user = await createUser();

        expect(await getCartVariantIds(user.id)).toEqual([]);
    });

    it("devolve as variants adicionadas, uma vez cada", async () => {
        const user = await createUser();
        const { steamId, xboxId } = await seedVariants();

        await addToCart(user.id, steamId);
        await addToCart(user.id, steamId);
        await addToCart(user.id, xboxId);

        expect((await getCartVariantIds(user.id)).sort()).toEqual([steamId, xboxId].sort());
    });

    it("não inclui a variant removida", async () => {
        const user = await createUser();
        const { steamId, xboxId } = await seedVariants();
        await addToCart(user.id, steamId);
        await addToCart(user.id, xboxId);

        await removeFromCart(user.id, steamId);

        expect(await getCartVariantIds(user.id)).toEqual([xboxId]);
    });

    it("só olha o carrinho do próprio usuário", async () => {
        const [owner, other] = await Promise.all([createUser(), createUser()]);
        const { steamId } = await seedVariants();
        await addToCart(owner.id, steamId);

        expect(await getCartVariantIds(other.id)).toEqual([]);
    });
});
