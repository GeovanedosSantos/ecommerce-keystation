import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
    ConflictError,
    NotFoundError,
    UnprocessableEntityError,
    ValidationError,
} from "@/core/errors";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import {
    createProduct,
    createVariant,
    getPublishedProductBySlug,
    getVariantsAvailability,
} from "./service";

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

describe("getPublishedProductBySlug", () => {
    it("lança NotFoundError para slug inexistente", async () => {
        const error = await errorOf(getPublishedProductBySlug("nao-existe"));

        expect(error).toBeInstanceOf(NotFoundError);
    });

    it("trata produto sem variant publicada como inexistente", async () => {
        const steam = await createPlatform();
        await createProduct({ ...game, variants: [{ ...variant(steam.id), status: "DISABLED" }] });

        const error = await errorOf(getPublishedProductBySlug("hollow-knight"));

        expect(error).toBeInstanceOf(NotFoundError);
    });

    it("retorna só as variants publicadas, ordenadas pela plataforma", async () => {
        const [xbox, steam, epic] = await Promise.all([
            createPlatform("Xbox"),
            createPlatform("Steam"),
            createPlatform("Epic"),
        ]);
        await createProduct({
            ...game,
            variants: [
                { ...variant(xbox.id), status: "PUBLISHED" },
                { ...variant(steam.id), status: "PUBLISHED" },
                { ...variant(epic.id), status: "DISABLED" },
            ],
        });

        const product = await getPublishedProductBySlug("hollow-knight");

        expect(product.variants.map(({ platform }) => platform.name)).toEqual(["Steam", "Xbox"]);
    });
});

describe("getVariantsAvailability", () => {
    const DAY = 24 * 60 * 60 * 1000;

    /** Cria o Hollow Knight com uma variant Steam publicada e `keys` chaves disponíveis. */
    async function publishedVariant(keys = 1) {
        const steam = await createPlatform();
        await createProduct({ ...game, variants: [{ ...variant(steam.id), status: "PUBLISHED" }] });
        const published = await prisma.productVariant.findFirstOrThrow();

        await prisma.key.createMany({
            data: Array.from({ length: keys }, (_, index) => ({
                variantId: published.id,
                keyCode: `HK-${index}`,
            })),
        });

        return published;
    }

    /** Liga a variant a uma promoção; por padrão ativa e válida de ontem até amanhã. */
    async function promote(
        variantId: string,
        discountPercent: number,
        promotion: { isActive?: boolean; startsAt?: Date; endsAt?: Date } = {},
    ) {
        const now = Date.now();
        await prisma.promotion.create({
            data: {
                name: `Promoção ${discountPercent}%`,
                startsAt: new Date(now - DAY),
                endsAt: new Date(now + DAY),
                ...promotion,
                products: { create: { variantId, discountPercent } },
            },
        });
    }

    it("marca como esgotada a variant sem chaves disponíveis", async () => {
        const published = await publishedVariant(0);

        const [availability] = await getVariantsAvailability([published.id]);

        expect(availability).toMatchObject({ inStock: false, discountPercent: null });
        expect(availability.price.toFixed(2)).toBe("49.90");
    });

    it("não conta chaves vendidas como estoque", async () => {
        const published = await publishedVariant(1);
        await prisma.key.updateMany({ data: { status: "SOLD" } });

        const [availability] = await getVariantsAvailability([published.id]);

        expect(availability.inStock).toBe(false);
    });

    it("calcula o estoque de cada variant separadamente", async () => {
        const withKeys = await publishedVariant(3);
        const epic = await createPlatform("Epic Games");
        const { slug } = await prisma.product.findUniqueOrThrow({
            where: { id: withKeys.productId },
        });
        const withoutKeys = await createVariant(slug, {
            ...variant(epic.id),
            status: "PUBLISHED",
        });

        const availability = await getVariantsAvailability([withKeys.id, withoutKeys.id]);

        expect(availability).toHaveLength(2);
        expect(availability).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ variantId: withKeys.id, inStock: true }),
                expect.objectContaining({ variantId: withoutKeys.id, inStock: false }),
            ]),
        );
    });

    it("retorna o maior desconto entre as promoções ativas", async () => {
        const published = await publishedVariant();
        await promote(published.id, 10);
        await promote(published.id, 35);

        const [availability] = await getVariantsAvailability([published.id]);

        expect(availability).toMatchObject({ inStock: true, discountPercent: 35 });
    });

    it.each([
        ["inativa", { isActive: false }],
        [
            "que ainda não começou",
            { startsAt: new Date(Date.now() + DAY), endsAt: new Date(Date.now() + 2 * DAY) },
        ],
        [
            "já encerrada",
            { startsAt: new Date(Date.now() - 2 * DAY), endsAt: new Date(Date.now() - DAY) },
        ],
    ])("ignora promoção %s", async (_label, promotion) => {
        const published = await publishedVariant();
        await promote(published.id, 50, promotion);

        const [availability] = await getVariantsAvailability([published.id]);

        expect(availability.discountPercent).toBeNull();
    });

    it("não retorna variant despublicada nem id inexistente", async () => {
        const published = await publishedVariant();
        await prisma.productVariant.update({
            where: { id: published.id },
            data: { status: "DISABLED" },
        });

        expect(await getVariantsAvailability([published.id, crypto.randomUUID()])).toEqual([]);
    });
});
