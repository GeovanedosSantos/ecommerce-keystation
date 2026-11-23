import { describe, expect, it } from "vitest";
import { Category } from "@/generated/prisma/enums";
import {
    DEFAULT_CATALOG_QUERY,
    MAX_SEARCH_LENGTH,
    parseCatalogQuery,
    toCatalogSearchParams,
    type CatalogQuery,
} from "./schema";

describe("parseCatalogQuery", () => {
    it("sem parâmetros, devolve o catálogo completo por relevância na página 1", () => {
        expect(parseCatalogQuery({})).toEqual({
            q: undefined,
            genres: [],
            platforms: [],
            developers: [],
            categories: [],
            onSale: false,
            minPriceCents: undefined,
            maxPriceCents: undefined,
            sort: "relevance",
            page: 1,
        });
    });

    it("lê todos os filtros", () => {
        const query = parseCatalogQuery({
            q: "elden",
            genre: ["rpg", "acao"],
            platform: "steam",
            developer: "fromsoftware",
            type: ["game", "special-edition"],
            sale: "1",
            min: "50",
            max: "199.90",
            sort: "price-asc",
            page: "3",
        });

        expect(query).toEqual({
            q: "elden",
            genres: ["rpg", "acao"],
            platforms: ["steam"],
            developers: ["fromsoftware"],
            categories: [Category.GAME, Category.SPECIAL_EDITION],
            onSale: true,
            minPriceCents: 5000,
            maxPriceCents: 19990,
            sort: "price-asc",
            page: 3,
        });
    });

    describe("busca", () => {
        it.each([
            ["", undefined],
            ["   ", undefined],
            ["  elden ring  ", "elden ring"],
        ])("q=%j vira %j", (q, expected) => {
            expect(parseCatalogQuery({ q }).q).toBe(expected);
        });

        it("corta o termo no tamanho máximo", () => {
            const { q } = parseCatalogQuery({ q: "a".repeat(MAX_SEARCH_LENGTH + 50) });
            expect(q).toHaveLength(MAX_SEARCH_LENGTH);
        });

        it("usa o primeiro termo quando q vem repetido", () => {
            expect(parseCatalogQuery({ q: ["elden", "ring"] }).q).toBe("elden");
        });
    });

    describe("filtros de lista", () => {
        it("aceita um valor único ou repetido", () => {
            expect(parseCatalogQuery({ genre: "rpg" }).genres).toEqual(["rpg"]);
            expect(parseCatalogQuery({ genre: ["rpg", "acao"] }).genres).toEqual(["rpg", "acao"]);
        });

        it("descarta slugs inválidos e repetidos, e normaliza maiúsculas", () => {
            const { platforms } = parseCatalogQuery({
                platform: ["Steam", "steam", "", "x y", "play--station", "-xbox", "xbox"],
            });
            expect(platforms).toEqual(["steam", "xbox"]);
        });

        it("limita a quantidade de valores por filtro", () => {
            const genre = Array.from({ length: 50 }, (_, index) => `genero-${index}`);
            expect(parseCatalogQuery({ genre }).genres).toHaveLength(20);
        });

        it.each([
            ["game", Category.GAME],
            ["dlc", Category.DLC],
            ["special-edition", Category.SPECIAL_EDITION],
            ["DLC", Category.DLC],
        ])("type=%j vira %s", (type, category) => {
            expect(parseCatalogQuery({ type }).categories).toEqual([category]);
        });

        it("descarta tipos desconhecidos", () => {
            expect(parseCatalogQuery({ type: ["GAME_PASS", "dlc"] }).categories).toEqual([
                Category.DLC,
            ]);
        });
    });

    describe("oferta", () => {
        it.each(["1", "true", "on", "TRUE"])("sale=%j liga o filtro", (sale) => {
            expect(parseCatalogQuery({ sale }).onSale).toBe(true);
        });

        it.each([undefined, "", "0", "false", "sim"])("sale=%j deixa o filtro desligado", (sale) => {
            expect(parseCatalogQuery({ sale }).onSale).toBe(false);
        });
    });

    describe("faixa de preço", () => {
        it.each([
            ["50", 5000],
            ["49.9", 4990],
            ["49,90", 4990],
            ["0", 0],
            ["199.99", 19999],
        ])("min=%j vira %i centavos", (min, cents) => {
            expect(parseCatalogQuery({ min }).minPriceCents).toBe(cents);
        });

        it.each(["", "abc", "-10", "10.999", "1e3", "12345678"])(
            "descarta o preço inválido %j",
            (max) => {
                expect(parseCatalogQuery({ max }).maxPriceCents).toBeUndefined();
            },
        );

        it("troca min e max quando a faixa vem invertida", () => {
            const query = parseCatalogQuery({ min: "200", max: "50" });
            expect(query.minPriceCents).toBe(5000);
            expect(query.maxPriceCents).toBe(20000);
        });

        it("aceita só um dos limites", () => {
            const query = parseCatalogQuery({ max: "100" });
            expect(query.minPriceCents).toBeUndefined();
            expect(query.maxPriceCents).toBe(10000);
        });
    });

    describe("ordenação", () => {
        it.each(["relevance", "price-asc", "price-desc", "newest"] as const)(
            "aceita sort=%j",
            (sort) => {
                expect(parseCatalogQuery({ sort }).sort).toBe(sort);
            },
        );

        it.each([undefined, "", "cheapest", "PRICE-ASC"])("sort=%j vira relevance", (sort) => {
            expect(parseCatalogQuery({ sort }).sort).toBe("relevance");
        });
    });

    describe("página", () => {
        it.each([
            ["2", 2],
            [["4", "9"], 4],
        ])("page=%j vira %i", (page, expected) => {
            expect(parseCatalogQuery({ page }).page).toBe(expected);
        });

        it.each([undefined, "", "0", "-1", "abc", "2.5", "999999"])("page=%j vira 1", (page) => {
            expect(parseCatalogQuery({ page }).page).toBe(1);
        });
    });

    it("ignora parâmetros desconhecidos", () => {
        expect(parseCatalogQuery({ utm_source: "newsletter" })).toEqual(DEFAULT_CATALOG_QUERY);
    });
});

describe("toCatalogSearchParams", () => {
    it("não escreve nada para a consulta padrão", () => {
        expect(toCatalogSearchParams(DEFAULT_CATALOG_QUERY).toString()).toBe("");
    });

    it("escreve os filtros com os nomes da URL", () => {
        const params = toCatalogSearchParams({
            ...DEFAULT_CATALOG_QUERY,
            q: "elden ring",
            genres: ["rpg", "acao"],
            categories: [Category.SPECIAL_EDITION],
            onSale: true,
            minPriceCents: 4990,
            sort: "newest",
            page: 2,
        });

        expect(params.toString()).toBe(
            "q=elden+ring&genre=rpg&genre=acao&type=special-edition&sale=1&min=49.9&sort=newest&page=2",
        );
    });

    it("volta para a mesma consulta depois do parse", () => {
        const query: CatalogQuery = {
            q: "pokémon",
            genres: ["rpg"],
            platforms: ["steam", "xbox"],
            developers: ["fromsoftware"],
            categories: [Category.GAME, Category.DLC],
            onSale: true,
            minPriceCents: 1999,
            maxPriceCents: 20000,
            sort: "price-desc",
            page: 5,
        };

        const params = toCatalogSearchParams(query);
        const searchParams = Object.fromEntries(
            [...new Set(params.keys())].map((key) => [key, params.getAll(key)]),
        );

        expect(parseCatalogQuery(searchParams)).toEqual(query);
    });
});
