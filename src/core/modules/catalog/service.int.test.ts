import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { applyPercentDiscount } from "@/core/modules/cart/pricing";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import {
    addKey,
    createGame,
    DAY,
    createGenre,
    createPlatform,
    createPromotion,
    NOW,
    search,
    titlesOf,
} from "@/test/fixtures/catalog";
import { getCatalogFacets } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("searchCatalog: busca", () => {
    it.each([
        ["pokemon", "Pokémon Edição Ouro"],
        ["POKÉMON", "Pokémon Edição Ouro"],
        ["edicao ouro", "Pokémon Edição Ouro"],
        ["acao", "Ação Total"],
    ])("q=%j encontra %j sem diferenciar acentos nem maiúsculas", async (q, title) => {
        const steam = await createPlatform("Steam");
        await createGame({ title, variants: [{ platformId: steam.id, price: 50 }] });
        await createGame({ title: "Outro Jogo", variants: [{ platformId: steam.id, price: 50 }] });

        expect(await titlesOf({ q })).toEqual([title]);
    });

    it("encontra pela desenvolvedora", async () => {
        const steam = await createPlatform("Steam");
        await createGame({
            title: "Elden Ring",
            developer: "FromSoftware",
            variants: [{ platformId: steam.id, price: 200 }],
        });
        await createGame({
            title: "Hades",
            developer: "Supergiant",
            variants: [{ platformId: steam.id, price: 50 }],
        });

        expect(await titlesOf({ q: "fromsoft" })).toEqual(["Elden Ring"]);
    });

    it.each(["%", "_", "\\"])("trata %j como texto, não como curinga", async (q) => {
        const steam = await createPlatform("Steam");
        await createGame({ title: "Hades", variants: [{ platformId: steam.id, price: 50 }] });
        await createGame({
            title: `100${q} Jogo`,
            variants: [{ platformId: steam.id, price: 50 }],
        });

        expect(await titlesOf({ q })).toEqual([`100${q} Jogo`]);
    });

    it("com relevância, o título que começa com o termo vem primeiro", async () => {
        const steam = await createPlatform("Steam");
        await createGame({
            title: "Legend of Ring",
            variants: [{ platformId: steam.id, price: 50, releaseDate: "2026-05-01" }],
        });
        await createGame({
            title: "Ring Fit",
            variants: [{ platformId: steam.id, price: 50, releaseDate: "2020-01-01" }],
        });

        expect(await titlesOf({ q: "ring" })).toEqual(["Ring Fit", "Legend of Ring"]);
    });
});

describe("searchCatalog: filtros", () => {
    async function seedCatalog() {
        const [steam, xbox, action, rpg] = await Promise.all([
            createPlatform("Steam"),
            createPlatform("Xbox"),
            createGenre("Ação"),
            createGenre("RPG"),
        ]);
        const base = await createGame({
            title: "Elden Ring",
            developer: "FromSoftware",
            genreIds: [action.id, rpg.id],
            variants: [
                { platformId: steam.id, price: 200 },
                { platformId: xbox.id, price: 250 },
            ],
        });
        await createGame({
            title: "Elden Ring DLC",
            category: "DLC",
            baseProductId: base.id,
            developer: "FromSoftware",
            genreIds: [rpg.id],
            variants: [{ platformId: steam.id, price: 80 }],
        });
        await createGame({
            title: "Forza",
            developer: "Playground Games",
            genreIds: [],
            variants: [{ platformId: xbox.id, price: 150 }],
        });
        await createGame({
            title: "Hades",
            developer: "Supergiant",
            genreIds: [action.id],
            variants: [{ platformId: steam.id, price: 50 }],
        });
    }

    const sortedTitles = async (params: Record<string, string | string[]>) =>
        (await search(params)).items
            .map(({ title, platform }) => `${title} (${platform.name})`)
            .sort();

    it("cada card é uma variant: o jogo aparece uma vez por plataforma", async () => {
        await seedCatalog();

        expect(await sortedTitles({ q: "elden ring" })).toEqual([
            "Elden Ring (Steam)",
            "Elden Ring (Xbox)",
            "Elden Ring DLC (Steam)",
        ]);
    });

    it.each([
        [{ genre: "acao" }, ["Elden Ring (Steam)", "Elden Ring (Xbox)", "Hades (Steam)"]],
        [
            { genre: ["acao", "rpg"] },
            ["Elden Ring (Steam)", "Elden Ring (Xbox)", "Elden Ring DLC (Steam)", "Hades (Steam)"],
        ],
        [{ platform: "xbox" }, ["Elden Ring (Xbox)", "Forza (Xbox)"]],
        [{ type: "dlc" }, ["Elden Ring DLC (Steam)"]],
        [{ type: ["dlc", "game"], platform: "xbox" }, ["Elden Ring (Xbox)", "Forza (Xbox)"]],
        [
            { developer: ["fromsoftware", "supergiant"], platform: "steam" },
            ["Elden Ring (Steam)", "Elden Ring DLC (Steam)", "Hades (Steam)"],
        ],
        [{ genre: "acao", platform: "xbox" }, ["Elden Ring (Xbox)"]],
    ])("OU dentro do filtro e E entre filtros: %j", async (params, expected) => {
        await seedCatalog();

        expect(await sortedTitles(params)).toEqual(expected);
    });

    it.each([{ genre: "inexistente" }, { platform: "nintendo" }, { developer: "ninguem" }])(
        "slug desconhecido (%j) não devolve nada",
        async (params) => {
            await seedCatalog();

            expect(await search(params)).toMatchObject({ items: [], total: 0, pageCount: 0 });
        },
    );

    it("ignora o slug desconhecido quando há outro válido no mesmo filtro", async () => {
        await seedCatalog();

        expect(await sortedTitles({ platform: ["nintendo", "xbox"] })).toEqual([
            "Elden Ring (Xbox)",
            "Forza (Xbox)",
        ]);
    });
});

describe("searchCatalog: preço e oferta", () => {
    it("usa a maior promoção ativa e o mesmo arredondamento do carrinho", async () => {
        const steam = await createPlatform("Steam");
        const game = await createGame({
            title: "Cyberpunk",
            variants: [{ platformId: steam.id, price: 199.99 }],
        });
        await createPromotion(game.variantId(steam.id), 30);
        await createPromotion(game.variantId(steam.id), 50);

        const [item] = (await search()).items;

        expect(item).toMatchObject({
            priceCents: 19999,
            discountPercent: 50,
            promotionalPriceCents: 10000,
        });
        expect(item.promotionalPriceCents).toBe(applyPercentDiscount(19999, 50));
    });

    it.each([
        ["inativa", { isActive: false }],
        ["expirada", { endsAt: new Date(NOW.getTime() - DAY) }],
        ["futura", { startsAt: new Date(NOW.getTime() + DAY) }],
    ])("promoção %s não conta como oferta", async (_, window) => {
        const steam = await createPlatform("Steam");
        const game = await createGame({
            title: "Hades",
            variants: [{ platformId: steam.id, price: 50 }],
        });
        await createPromotion(game.variantId(steam.id), 40, window);

        expect((await search()).items[0]).toMatchObject({
            discountPercent: null,
            promotionalPriceCents: null,
        });
        expect(await titlesOf({ sale: "1" })).toEqual([]);
    });

    it("o filtro de oferta mostra só variants com promoção ativa", async () => {
        const steam = await createPlatform("Steam");
        const promo = await createGame({
            title: "Em Oferta",
            variants: [{ platformId: steam.id, price: 100 }],
        });
        await createGame({
            title: "Preço Cheio",
            variants: [{ platformId: steam.id, price: 100 }],
        });
        await createPromotion(promo.variantId(steam.id), 20);

        expect(await titlesOf({ sale: "1" })).toEqual(["Em Oferta"]);
    });

    it("a faixa de preço usa o preço com desconto e inclui os limites", async () => {
        const steam = await createPlatform("Steam");
        const promo = await createGame({
            title: "De 200 por 100",
            variants: [{ platformId: steam.id, price: 200 }],
        });
        await createGame({
            title: "Cento e Cinquenta",
            variants: [{ platformId: steam.id, price: 150 }],
        });
        await createGame({ title: "Duzentos", variants: [{ platformId: steam.id, price: 200 }] });
        await createPromotion(promo.variantId(steam.id), 50);

        expect(await titlesOf({ min: "100", max: "150", sort: "price-asc" })).toEqual([
            "De 200 por 100",
            "Cento e Cinquenta",
        ]);
        expect(await titlesOf({ min: "199.99" })).toEqual(["Duzentos"]);
    });
});

describe("searchCatalog: disponibilidade", () => {
    it("não mostra variants DISABLED", async () => {
        const [steam, xbox] = await Promise.all([createPlatform("Steam"), createPlatform("Xbox")]);
        await createGame({
            title: "Hades",
            variants: [
                { platformId: steam.id, price: 50 },
                { platformId: xbox.id, price: 50, status: "DISABLED" },
            ],
        });

        const { items, total } = await search();

        expect(total).toBe(1);
        expect(items.map(({ platform }) => platform.slug)).toEqual(["steam"]);
    });

    it("variant sem chave disponível aparece como esgotada", async () => {
        const steam = await createPlatform("Steam");
        const inStock = await createGame({
            title: "Com Chave",
            variants: [{ platformId: steam.id, price: 50 }],
        });
        await createGame({ title: "Sem Chave", variants: [{ platformId: steam.id, price: 50 }] });
        await addKey(inStock.variantId(steam.id));

        const stock = Object.fromEntries(
            (await search()).items.map(({ title, inStock: available }) => [title, available]),
        );

        expect(stock).toEqual({ "Com Chave": true, "Sem Chave": false });
    });
});

describe("getCatalogFacets", () => {
    it("lista só gêneros, plataformas e desenvolvedoras com variant publicada", async () => {
        const [steam, xbox, action, puzzle] = await Promise.all([
            createPlatform("Steam"),
            createPlatform("Xbox"),
            createGenre("Ação"),
            createGenre("Puzzle"),
        ]);
        await createGame({
            title: "Hades",
            developer: "Supergiant",
            genreIds: [action.id],
            variants: [{ platformId: steam.id, price: 50 }],
        });
        await createGame({
            title: "Escondido",
            developer: "Estúdio Oculto",
            genreIds: [puzzle.id],
            variants: [{ platformId: xbox.id, price: 50, status: "DISABLED" }],
        });

        expect(await getCatalogFacets()).toEqual({
            genres: [{ id: action.id, name: "Ação", slug: "acao" }],
            platforms: [{ id: steam.id, name: "Steam", slug: "steam" }],
            developers: [{ name: "Supergiant", slug: "supergiant" }],
        });
    });
});
