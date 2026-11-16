import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, UnprocessableEntityError, ValidationError } from "@/core/errors";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createProduct, createVariant } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const game = { category: "GAME", title: "Hollow Knight", description: "Metroidvania" };

const createPlatform = (name = "Steam") => prisma.platform.create({ data: { name } });

const variant = (platformId: string, price = 49.9) => ({
    platformId,
    price,
    releaseDate: "2026-01-01",
});

/** Executa e devolve o erro lançado, para poder conferir a classe e a mensagem. */
const errorOf = (promise: Promise<unknown>) =>
    promise.then(
        () => {
            throw new Error("era esperado um erro, mas a operação deu certo");
        },
        (error: unknown) => error,
    );

describe("createProduct", () => {
    it("recusa o mesmo produto cadastrado duas vezes", async () => {
        await createProduct(game);

        const error = await errorOf(createProduct(game));

        expect(error).toBeInstanceOf(ConflictError);
        expect(error).toHaveProperty("message", expect.stringContaining('"hollow-knight"'));
        expect(await prisma.product.count()).toBe(1);
    });

    it("recusa um slug explícito já usado por outro produto", async () => {
        await createProduct(game);

        const error = await errorOf(
            createProduct({ ...game, title: "Outro Título", slug: "hollow-knight" }),
        );

        expect(error).toBeInstanceOf(ConflictError);
    });

    it.each(["DLC", "SPECIAL_EDITION"])("recusa %s sem baseProductId", async (category) => {
        const error = await errorOf(
            createProduct({ category, title: `Hollow Knight ${category}`, description: "x" }),
        );

        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect(error).toHaveProperty(
            "message",
            `baseProductId é obrigatório para a categoria ${category}`,
        );
        expect(await prisma.product.count()).toBe(0);
    });

    it.each(["DLC", "SPECIAL_EDITION"])(
        "aceita %s com um GAME como produto base",
        async (category) => {
            const base = await createProduct(game);

            const product = await createProduct({
                category,
                title: `Hollow Knight ${category}`,
                description: "x",
                baseProductId: base.id,
            });

            expect(product.baseProductId).toBe(base.id);
        },
    );

    it("recusa GAME com baseProductId", async () => {
        const base = await createProduct(game);

        const error = await errorOf(
            createProduct({ ...game, title: "Outro Jogo", baseProductId: base.id }),
        );

        expect(error).toBeInstanceOf(UnprocessableEntityError);
    });

    it("recusa a mesma plataforma repetida nas variants do produto", async () => {
        const steam = await createPlatform();

        const error = await errorOf(
            createProduct({ ...game, variants: [variant(steam.id), variant(steam.id)] }),
        );

        expect(error).toBeInstanceOf(ValidationError);
        expect(await prisma.product.count()).toBe(0);
    });

    it.each([0, -10])("recusa variant com preço %s e não grava nada", async (price) => {
        const steam = await createPlatform();

        const error = await errorOf(
            createProduct({ ...game, variants: [variant(steam.id, price)] }),
        );

        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).zodError.issues[0].path).toEqual([
            "variants",
            0,
            "price",
        ]);
        expect(await prisma.product.count()).toBe(0);
    });
});

describe("createVariant", () => {
    it("recusa a mesma variant (produto + plataforma) cadastrada duas vezes", async () => {
        const steam = await createPlatform();
        await createProduct(game);
        await createVariant("hollow-knight", variant(steam.id));

        const error = await errorOf(createVariant("hollow-knight", variant(steam.id, 10)));

        expect(error).toBeInstanceOf(ConflictError);
        expect(await prisma.productVariant.count()).toBe(1);
    });

    it("recusa variant já criada junto com o produto", async () => {
        const steam = await createPlatform();
        await createProduct({ ...game, variants: [variant(steam.id)] });

        const error = await errorOf(createVariant("hollow-knight", variant(steam.id)));

        expect(error).toBeInstanceOf(ConflictError);
    });

    it("aceita o mesmo produto em plataformas diferentes", async () => {
        const [steam, epic] = await Promise.all([createPlatform("Steam"), createPlatform("Epic")]);
        await createProduct({ ...game, variants: [variant(steam.id)] });

        await createVariant("hollow-knight", variant(epic.id));

        expect(await prisma.productVariant.count()).toBe(2);
    });

    it.each([0, -1])("recusa preço %s e não grava a variant", async (price) => {
        const steam = await createPlatform();
        await createProduct(game);

        const error = await errorOf(createVariant("hollow-knight", variant(steam.id, price)));

        expect(error).toBeInstanceOf(ValidationError);
        expect(await prisma.productVariant.count()).toBe(0);
    });

    it("grava o preço com 2 casas decimais", async () => {
        const steam = await createPlatform();
        await createProduct(game);

        const created = await createVariant("hollow-knight", variant(steam.id, 59.9));

        expect(created.price.toFixed(2)).toBe("59.90");
    });
});
