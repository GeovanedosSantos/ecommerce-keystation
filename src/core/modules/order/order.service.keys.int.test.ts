import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import {
    createPendingOrder,
    createStockedGame,
    createUser,
    keyStatuses,
    pixPayment,
} from "@/test/fixtures/order";
import { getCartVariantIds } from "@/core/modules/cart/cart.service";
import { cancelOrder, payOrder, revealKey } from "./order.service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function setup() {
    const user = await createUser();
    const game = await createStockedGame("Hades", 50, 1);
    const orderId = await createPendingOrder(user.id, [game]);
    return { user, orderId };
}

describe("cancelOrder", () => {
    it("cancela o pedido e devolve as chaves RESERVED para AVAILABLE", async () => {
        const { user, orderId } = await setup();

        expect(await cancelOrder(user.id, orderId)).toEqual({ ok: true });

        expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("CANCELED");
        const key = await prisma.key.findFirstOrThrow();
        expect(key).toMatchObject({ status: "AVAILABLE", orderItemId: null });
        expect((await prisma.orderItem.findFirstOrThrow()).status).toBe("CANCELED");
        expect(await getCartVariantIds(user.id)).toEqual([key.variantId]);
    });

    it("não mexe em pedido PAID", async () => {
        const { user, orderId } = await setup();
        await payOrder(user.id, orderId, randomUUID(), pixPayment());

        expect(await cancelOrder(user.id, orderId)).toEqual({ ok: false, error: "NOT_PENDING" });

        expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("PAID");
        expect(await keyStatuses()).toEqual(["SOLD"]);
        expect((await prisma.orderItem.findFirstOrThrow()).status).toBe("DELIVERED");
    });

    it("não cancela pedido de outro usuário", async () => {
        const { orderId } = await setup();
        const stranger = await createUser();

        expect(await cancelOrder(stranger.id, orderId)).toEqual({ ok: false, error: "NOT_FOUND" });
        expect(await keyStatuses()).toEqual(["RESERVED"]);
    });
});

describe("revealKey", () => {
    async function paidKey() {
        const { user, orderId } = await setup();
        await payOrder(user.id, orderId, randomUUID(), pixPayment());
        const key = await prisma.key.findFirstOrThrow();
        return { user, key };
    }

    it("passa SOLD para REVEALED e devolve o código", async () => {
        const { user, key } = await paidKey();

        expect(await revealKey(user.id, key.id)).toEqual({ ok: true, keyCode: key.keyCode });

        const revealed = await prisma.key.findUniqueOrThrow({ where: { id: key.id } });
        expect(revealed.status).toBe("REVEALED");
        expect(revealed.revealedAt).not.toBeNull();
    });

    it("é idempotente: revelar de novo mantém o revealedAt", async () => {
        const { user, key } = await paidKey();
        await revealKey(user.id, key.id);
        const first = (await prisma.key.findUniqueOrThrow({ where: { id: key.id } })).revealedAt;

        expect(await revealKey(user.id, key.id)).toEqual({ ok: true, keyCode: key.keyCode });

        expect((await prisma.key.findUniqueOrThrow({ where: { id: key.id } })).revealedAt).toEqual(first);
    });

    it("recusa chave de outro usuário e não altera o status", async () => {
        const { key } = await paidKey();
        const stranger = await createUser();

        expect(await revealKey(stranger.id, key.id)).toEqual({ ok: false, error: "NOT_FOUND" });
        expect((await prisma.key.findUniqueOrThrow({ where: { id: key.id } })).status).toBe("SOLD");
    });

    it("recusa chave ainda RESERVED", async () => {
        const { user } = await setup();
        const key = await prisma.key.findFirstOrThrow();

        expect(await revealKey(user.id, key.id)).toEqual({ ok: false, error: "NOT_SOLD" });
        expect((await prisma.key.findUniqueOrThrow({ where: { id: key.id } })).status).toBe("RESERVED");
    });
});
