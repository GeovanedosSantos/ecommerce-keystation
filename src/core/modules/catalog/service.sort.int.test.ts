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

    it("relevância não conta itens reembolsados de pedidos pagos", async () => {
        const steam = await createPlatform("Steam");
        const refunded = await createGame({
            title: "Reembolsado",
            variants: [{ platformId: steam.id, price: 99, releaseDate: "2020-01-01" }],
        });
        await sell(refunded.variantId(steam.id), 3);
        await sell(refunded.variantId(steam.id), 5, "PAID", "REFUNDED");
        const delivered = await createGame({
            title: "Entregue",
            variants: [{ platformId: steam.id, price: 99, releaseDate: "2019-01-01" }],
        });
        await sell(delivered.variantId(steam.id), 4, "PAID", "DELIVERED");

        expect(await titlesOf()).toEqual(["Entregue", "Reembolsado"]);
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

    it("página além da última volta vazia, mas com o total e o número de páginas", async () => {
        await seedPages();

        expect(await search({ page: "3" })).toMatchObject({
            items: [],
            total: totalGames,
            page: 3,
            pageCount: 2,
        });
    });
});
