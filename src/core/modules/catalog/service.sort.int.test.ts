import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import {
    createGame,
    createPlatform,
    createPromotion,
    search,
    sell,
    titlesOf,
} from "@/test/fixtures/catalog";
import { CATALOG_PAGE_SIZE } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("searchCatalog: ordenação", () => {
    async function seedCatalog() {
        const steam = await createPlatform("Steam");
        const cheapAfterPromo = await createGame({
            title: "Barato na Promoção",
            variants: [{ platformId: steam.id, price: 300, releaseDate: "2024-01-01" }],
        });
        await createGame({
            title: "Médio",
            variants: [{ platformId: steam.id, price: 120, releaseDate: "2026-03-01" }],
        });
        await createGame({
            title: "Caro",
            variants: [{ platformId: steam.id, price: 250, releaseDate: "2025-06-01" }],
        });
        await createPromotion(cheapAfterPromo.variantId(steam.id), 90);
        return { steam, cheapAfterPromo };
    }

    it("menor preço considera o preço com desconto", async () => {
        await seedCatalog();

        expect(await titlesOf({ sort: "price-asc" })).toEqual([
            "Barato na Promoção",
            "Médio",
            "Caro",
        ]);
    });

    it("maior preço considera o preço com desconto", async () => {
        await seedCatalog();

        expect(await titlesOf({ sort: "price-desc" })).toEqual([
            "Caro",
            "Médio",
            "Barato na Promoção",
        ]);
    });

    it("lançamento ordena pela data mais recente", async () => {
        await seedCatalog();

        expect(await titlesOf({ sort: "newest" })).toEqual(["Médio", "Caro", "Barato na Promoção"]);
    });

    it("relevância ordena pelos mais vendidos, contando só pedidos pagos", async () => {
        const { steam } = await seedCatalog();
        const bestSeller = await createGame({
            title: "Mais Vendido",
            variants: [{ platformId: steam.id, price: 99, releaseDate: "2020-01-01" }],
        });
        await sell(bestSeller.variantId(steam.id), 3);
        const pending = await createGame({
            title: "Só Pendente",
            variants: [{ platformId: steam.id, price: 99, releaseDate: "2019-01-01" }],
        });
        await sell(pending.variantId(steam.id), 5, "PENDING");

        expect(await titlesOf()).toEqual([
            "Mais Vendido",
            // Sem vendas pagas: desempata pelo lançamento mais recente.
            "Médio",
            "Caro",
            "Barato na Promoção",
            "Só Pendente",
        ]);
    });

    it("empate total é desfeito pelo título", async () => {
        const steam = await createPlatform("Steam");
        for (const title of ["Charlie", "Alpha", "Bravo"]) {
            await createGame({ title, variants: [{ platformId: steam.id, price: 50 }] });
        }

        expect(await titlesOf({ sort: "price-asc" })).toEqual(["Alpha", "Bravo", "Charlie"]);
    });
});

describe("searchCatalog: paginação", () => {
    const totalGames = CATALOG_PAGE_SIZE + 2;

    async function seedPages() {
        const steam = await createPlatform("Steam");
        for (let index = 0; index < totalGames; index++) {
            await createGame({
                title: `Jogo ${String(index).padStart(2, "0")}`,
                variants: [{ platformId: steam.id, price: 10 + index }],
            });
        }
    }

    it("divide o resultado em páginas e informa o total", async () => {
        await seedPages();

        const first = await search({ sort: "price-asc" });
        const second = await search({ sort: "price-asc", page: "2" });

        expect(first).toMatchObject({ total: totalGames, page: 1, pageCount: 2 });
        expect(first.items).toHaveLength(CATALOG_PAGE_SIZE);
        expect(second.items.map(({ title }) => title)).toEqual([
            `Jogo ${CATALOG_PAGE_SIZE}`,
            `Jogo ${CATALOG_PAGE_SIZE + 1}`,
        ]);
    });

    it("as páginas não repetem nem pulam itens", async () => {
        await seedPages();

        const pages = await Promise.all(["1", "2"].map((page) => titlesOf({ page })));
        const all = pages.flat();

        expect(new Set(all).size).toBe(totalGames);
    });

    it("página além da última devolve vazio", async () => {
        await seedPages();

        expect(await search({ page: "3" })).toMatchObject({ items: [], total: 0, page: 3 });
    });
});
