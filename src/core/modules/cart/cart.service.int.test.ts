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
