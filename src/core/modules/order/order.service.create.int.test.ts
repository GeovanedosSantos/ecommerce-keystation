import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createPromotion } from "@/test/fixtures/catalog";
import { createStockedGame, createUser, fillCart, keyStatuses } from "@/test/fixtures/order";
import { addToCart, getCartVariantIds } from "@/core/modules/cart/cart.service";
import { createOrderFromCart, RESERVATION_MINUTES } from "./order.service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("createOrderFromCart", () => {
    it("reserva uma chave por item, liga ao OrderItem e deixa as outras disponíveis", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 50, 3);
        const celeste = await createStockedGame("Celeste", 30, 1);
        await fillCart(user.id, [hades, celeste]);

        const result = await createOrderFromCart(user.id);

        expect(result.ok).toBe(true);
        expect(await keyStatuses()).toEqual(["AVAILABLE", "AVAILABLE", "RESERVED", "RESERVED"]);
        const reserved = await prisma.key.findMany({ where: { status: "RESERVED" } });
        expect(reserved.every((key) => key.orderItemId !== null)).toBe(true);
        expect(new Set(reserved.map((key) => key.variantId))).toEqual(new Set([hades, celeste]));
    });

    it("grava os preços com promoção e esvazia o carrinho", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 100);
        await createPromotion(hades, 20, { startsAt: new Date(0), endsAt: new Date(9e12) });
        await fillCart(user.id, [hades]);

        const result = await createOrderFromCart(user.id);

        expect(result.ok).toBe(true);
        const order = await prisma.order.findFirstOrThrow({ include: { items: true } });
        expect(order.status).toBe("PENDING");
        expect(order.number).toMatch(/^KS-\d{8}-[A-Z0-9]{6}$/);
        expect(Number(order.total)).toBe(80);
        expect(Number(order.items[0].originalPrice)).toBe(100);
        expect(Number(order.items[0].paidPrice)).toBe(80);
        expect(await prisma.shoppingCartItem.count()).toBe(0);
    });

    it("grava o desconto do cupom e libera o cupom do carrinho", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 100);
        const coupon = await prisma.coupon.create({
            data: { code: "DEZ", discountType: "PERCENTAGE", discountValue: 10 },
        });
        await fillCart(user.id, [hades]);
        await prisma.shoppingCart.update({ where: { userId: user.id }, data: { couponId: coupon.id } });

        await createOrderFromCart(user.id);

        const order = await prisma.order.findFirstOrThrow();
        expect(Number(order.discountAmount)).toBe(10);
        expect(Number(order.total)).toBe(90);
        expect(order.couponCode).toBe("DEZ");
        expect(order.couponId).toBe(coupon.id);
        expect((await prisma.shoppingCart.findUniqueOrThrow({ where: { userId: user.id } })).couponId).toBeNull();
    });

    it("recusa cupom que estourou o limite de usos", async () => {
        const user = await createUser();
        const other = await createUser();
        const hades = await createStockedGame("Hades", 100, 2);
        const coupon = await prisma.coupon.create({
            data: { code: "UNICO", discountType: "PERCENTAGE", discountValue: 10, maxUses: 1 },
        });
        await fillCart(user.id, [hades]);
        await prisma.shoppingCart.update({ where: { userId: user.id }, data: { couponId: coupon.id } });
        await prisma.order.create({
            data: {
                number: "KS-OLD",
                userId: other.id,
                subtotal: 10,
                total: 10,
                couponId: coupon.id,
                status: "PAID",
            },
        });

        expect(await createOrderFromCart(user.id)).toEqual({ ok: false, error: "COUPON_INVALID" });
        expect(await prisma.order.count()).toBe(1);
        expect(await keyStatuses()).toEqual(["AVAILABLE", "AVAILABLE"]);
    });

    it("recusa o carrinho vazio", async () => {
        const user = await createUser();

        expect(await createOrderFromCart(user.id)).toEqual({ ok: false, error: "EMPTY_CART" });
        expect(await prisma.order.count()).toBe(0);
    });

    it("recusa com OUT_OF_STOCK quando falta chave e não grava nada", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 50, 1);
        const celeste = await createStockedGame("Celeste", 30, 1);
        await fillCart(user.id, [hades, celeste]);
        await prisma.key.deleteMany({ where: { variantId: celeste } });

        const result = await createOrderFromCart(user.id);

        expect(result).toEqual({ ok: false, error: "OUT_OF_STOCK", outOfStockTitles: ["Celeste"] });
        expect(await prisma.order.count()).toBe(0);
        expect(await prisma.orderItem.count()).toBe(0);
        expect(await keyStatuses()).toEqual(["AVAILABLE"]);
        expect(await prisma.shoppingCartItem.count()).toBe(2);
    });

    it("não reserva chave de variant despublicada", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 50, 1);
        await fillCart(user.id, [hades]);
        await prisma.productVariant.update({ where: { id: hades }, data: { status: "DISABLED" } });

        const result = await createOrderFromCart(user.id);

        expect(result).toMatchObject({ ok: false, error: "OUT_OF_STOCK" });
        expect(await keyStatuses()).toEqual(["AVAILABLE"]);
    });

    it("com dois checkouts concorrentes da última chave, só um vence", async () => {
        const [first, second] = await Promise.all([createUser(), createUser()]);
        const hades = await createStockedGame("Hades", 50, 1);
        await fillCart(first.id, [hades]);
        await fillCart(second.id, [hades]);

        const results = await Promise.all([
            createOrderFromCart(first.id),
            createOrderFromCart(second.id),
        ]);

        expect(results.filter((result) => result.ok)).toHaveLength(1);
        expect(results.filter((result) => !result.ok)).toEqual([
            expect.objectContaining({ error: "OUT_OF_STOCK" }),
        ]);
        expect(await prisma.order.count()).toBe(1);
        expect(await keyStatuses()).toEqual(["RESERVED"]);
    });

    it("dois checkouts do mesmo carrinho em paralelo criam um pedido só", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 50, 2);
        await fillCart(user.id, [hades]);

        const results = await Promise.all([
            createOrderFromCart(user.id),
            createOrderFromCart(user.id),
        ]);

        expect(results.filter((result) => result.ok)).toHaveLength(1);
        expect(results).toContainEqual({ ok: false, error: "EMPTY_CART" });
        expect(await prisma.order.count()).toBe(1);
        expect(await keyStatuses()).toEqual(["AVAILABLE", "RESERVED"]);
    });

    it("um pedido expirado libera a chave para um novo checkout", async () => {
        const [first, second] = await Promise.all([createUser(), createUser()]);
        const hades = await createStockedGame("Hades", 50, 1);
        await fillCart(first.id, [hades]);
        await fillCart(second.id, [hades]);
        const created = await createOrderFromCart(first.id);
        const old = new Date(Date.now() - (RESERVATION_MINUTES + 1) * 60 * 1000);
        await prisma.order.updateMany({ data: { createdAt: old } });

        const result = await createOrderFromCart(second.id);

        expect(result.ok).toBe(true);
        expect(created.ok).toBe(true);
        const expired = await prisma.order.findFirstOrThrow({ where: { userId: first.id } });
        expect(expired.status).toBe("CANCELED");
        const expiredItem = await prisma.orderItem.findFirstOrThrow({ where: { orderId: expired.id } });
        expect(expiredItem.status).toBe("CANCELED");
        const key = await prisma.key.findFirstOrThrow();
        expect(key.status).toBe("RESERVED");
        expect(await getCartVariantIds(first.id)).toEqual([hades]);
    });

    it("com a última chave presa num pedido abandonado, o jogo volta a poder ser adicionado ao carrinho", async () => {
        const [first, second] = await Promise.all([createUser(), createUser()]);
        const hades = await createStockedGame("Hades", 50, 1);
        await fillCart(first.id, [hades]);
        await createOrderFromCart(first.id);
        expect(await addToCart(second.id, hades)).toEqual({ ok: false, error: "OUT_OF_STOCK" });
        await prisma.order.updateMany({
            data: { createdAt: new Date(Date.now() - (RESERVATION_MINUTES + 1) * 60 * 1000) },
        });

        expect(await addToCart(second.id, hades)).toEqual({ ok: true });
        expect(await keyStatuses()).toEqual(["AVAILABLE"]);
    });

    it("recusa com COUPON_INVALID e remove o cupom que deixou de valer entre o carrinho e a confirmação", async () => {
        const user = await createUser();
        const hades = await createStockedGame("Hades", 100, 1);
        const coupon = await prisma.coupon.create({
            data: { code: "DEZ", discountType: "PERCENTAGE", discountValue: 10 },
        });
        await fillCart(user.id, [hades]);
        await prisma.shoppingCart.update({ where: { userId: user.id }, data: { couponId: coupon.id } });
        await prisma.coupon.update({ where: { id: coupon.id }, data: { isActive: false } });

        expect(await createOrderFromCart(user.id)).toEqual({ ok: false, error: "COUPON_INVALID" });

        expect(await prisma.order.count()).toBe(0);
        expect(await keyStatuses()).toEqual(["AVAILABLE"]);
        expect((await prisma.shoppingCart.findUniqueOrThrow({ where: { userId: user.id } })).couponId).toBeNull();
        expect(await getCartVariantIds(user.id)).toEqual([hades]);
    });
});
