import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import {
    createPendingOrder,
    createStockedGame,
    createUser,
    keyStatuses,
    OTHER_CPF,
    pixPayment,
    VALID_CPF,
} from "@/test/fixtures/order";
import { getCartVariantIds } from "@/core/modules/cart/cart.service";
import { payOrder, RESERVATION_MINUTES } from "./order.service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function setup(cpf?: string, keys = 1) {
    const user = await createUser(cpf);
    const game = await createStockedGame("Hades", 50, keys);
    const orderId = await createPendingOrder(user.id, [game]);
    return { user, game, orderId };
}

const expire = (orderId: string) =>
    prisma.order.update({
        where: { id: orderId },
        data: { createdAt: new Date(Date.now() - (RESERVATION_MINUTES + 1) * 60 * 1000) },
    });

describe("payOrder", () => {
    it("passa as chaves para SOLD, paga o pedido, cria o Payment SUCCEEDED e salva o CPF", async () => {
        const { user, orderId } = await setup();

        const result = await payOrder(user.id, orderId, randomUUID(), pixPayment());

        expect(result).toEqual({ ok: true, orderId, alreadyPaid: false });
        const order = await prisma.order.findUniqueOrThrow({
            where: { id: orderId },
            include: { items: true, payments: true },
        });
        expect(order.status).toBe("PAID");
        expect(order.paidAt).not.toBeNull();
        expect(order.items[0].status).toBe("DELIVERED");
        expect(order.payments).toHaveLength(1);
        expect(order.payments[0]).toMatchObject({ status: "SUCCEEDED", method: "pix" });
        expect(Number(order.payments[0].amount)).toBe(50);
        const key = await prisma.key.findFirstOrThrow();
        expect(key.status).toBe("SOLD");
        expect(key.soldAt).not.toBeNull();
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).cpf).toBe(VALID_CPF);
    });

    it("recusa CPF diferente do cadastrado e não grava nada", async () => {
        const { user, orderId } = await setup(VALID_CPF);

        const result = await payOrder(user.id, orderId, randomUUID(), pixPayment(OTHER_CPF));

        expect(result).toEqual({ ok: false, error: "CPF_MISMATCH" });
        expect(await prisma.payment.count()).toBe(0);
        expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("PENDING");
        expect(await keyStatuses()).toEqual(["RESERVED"]);
    });

    it("recusa CPF que pertence a outro usuário", async () => {
        await createUser(VALID_CPF);
        const { user, orderId } = await setup();

        const result = await payOrder(user.id, orderId, randomUUID(), pixPayment());

        expect(result).toEqual({ ok: false, error: "CPF_IN_USE" });
        expect(await prisma.payment.count()).toBe(0);
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).cpf).toBeNull();
    });

    it("recusa pedido expirado com EXPIRED, cancela e libera as chaves", async () => {
        const { user, game, orderId } = await setup();
        await expire(orderId);

        const result = await payOrder(user.id, orderId, randomUUID(), pixPayment());

        expect(result).toEqual({ ok: false, error: "EXPIRED" });
        expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("CANCELED");
        expect(await keyStatuses()).toEqual(["AVAILABLE"]);
        expect((await prisma.orderItem.findFirstOrThrow()).status).toBe("CANCELED");
        expect(await getCartVariantIds(user.id)).toEqual([game]);
        expect(await prisma.payment.count()).toBe(0);
    });

    it("não paga pedido cancelado", async () => {
        const { user, orderId } = await setup();
        await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });

        expect(await payOrder(user.id, orderId, randomUUID(), pixPayment())).toEqual({
            ok: false,
            error: "NOT_PENDING",
        });
        expect(await prisma.payment.count()).toBe(0);
    });

    it("não paga pedido de outro usuário", async () => {
        const { orderId } = await setup();
        const stranger = await createUser();

        expect(await payOrder(stranger.id, orderId, randomUUID(), pixPayment())).toEqual({
            ok: false,
            error: "NOT_FOUND",
        });
        expect(await keyStatuses()).toEqual(["RESERVED"]);
    });
});

describe("payOrder — idempotência", () => {
    it("repetir a mesma chave devolve alreadyPaid sem novo Payment nem novo soldAt", async () => {
        const { user, orderId } = await setup();
        const idempotencyKey = randomUUID();
        await payOrder(user.id, orderId, idempotencyKey, pixPayment());
        const soldAt = (await prisma.key.findFirstOrThrow()).soldAt;

        const again = await payOrder(user.id, orderId, idempotencyKey, pixPayment());

        expect(again).toEqual({ ok: true, orderId, alreadyPaid: true });
        expect(await prisma.payment.count()).toBe(1);
        expect((await prisma.key.findFirstOrThrow()).soldAt).toEqual(soldAt);
    });

    it("dois pagamentos em paralelo geram um Payment e as chaves SOLD uma vez", async () => {
        const { user, orderId } = await setup();

        const results = await Promise.all([
            payOrder(user.id, orderId, randomUUID(), pixPayment()),
            payOrder(user.id, orderId, randomUUID(), pixPayment()),
        ]);

        expect(results.map((result) => result.ok && result.alreadyPaid).sort()).toEqual([false, true]);
        expect(await prisma.payment.count()).toBe(1);
        expect(await keyStatuses()).toEqual(["SOLD"]);
    });

    it("dois pagamentos em paralelo com a mesma chave geram um Payment só", async () => {
        const { user, orderId } = await setup();
        const idempotencyKey = randomUUID();

        const results = await Promise.all([
            payOrder(user.id, orderId, idempotencyKey, pixPayment()),
            payOrder(user.id, orderId, idempotencyKey, pixPayment()),
        ]);

        expect(results.every((result) => result.ok)).toBe(true);
        expect(await prisma.payment.count()).toBe(1);
        expect(await keyStatuses()).toEqual(["SOLD"]);
    });

    it("reusar a chave em outro pedido dá IDEMPOTENCY_KEY_REUSED", async () => {
        const { user, orderId } = await setup();
        const idempotencyKey = randomUUID();
        await payOrder(user.id, orderId, idempotencyKey, pixPayment());
        const otherGame = await createStockedGame("Celeste", 30, 1);
        const otherOrderId = await createPendingOrder(user.id, [otherGame]);

        const result = await payOrder(user.id, otherOrderId, idempotencyKey, pixPayment());

        expect(result).toEqual({ ok: false, error: "IDEMPOTENCY_KEY_REUSED" });
        expect((await prisma.order.findUniqueOrThrow({ where: { id: otherOrderId } })).status).toBe("PENDING");
    });
});
