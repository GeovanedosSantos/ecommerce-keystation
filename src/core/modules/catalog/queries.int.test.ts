import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Category } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createGame, createPlatform, NOW, search } from "@/test/fixtures/catalog";
import { selectCatalogRows, type CatalogSqlFilters } from "./queries";
import type { CatalogSort } from "./schema";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const PAYLOADS = [
    "'; DROP TABLE product; --",
    "' OR '1'='1",
    "%' OR 1=1 --",
    "\\'; DELETE FROM product_variant; --",
    'elden\' UNION SELECT * FROM "user" --',
];

const filters = (overrides: Partial<CatalogSqlFilters> = {}): CatalogSqlFilters => ({
    categories: [],
    developerSlugs: [],
    onSale: false,
    sort: "relevance",
    limit: 24,
    offset: 0,
    now: NOW,
    ...overrides,
});

async function seedCatalog() {
    const steam = await createPlatform("Steam");
    await createGame({
        title: "Elden Ring",
        developer: "FromSoftware",
        variants: [{ platformId: steam.id, price: 200 }],
    });
    await createGame({ title: "Hades", variants: [{ platformId: steam.id, price: 50 }] });
}

/** Nada foi apagado nem alterado pela tentativa de injeção. */
async function expectCatalogIntact() {
    expect(await prisma.product.count()).toBe(2);
    expect(await prisma.productVariant.count()).toBe(2);
    expect((await selectCatalogRows(filters())).map(({ title }) => title).sort()).toEqual([
        "Elden Ring",
        "Hades",
    ]);
}

describe("selectCatalogRows: SQL injection", () => {
    it.each(PAYLOADS)("o termo %j é só texto procurado", async (payload) => {
        await seedCatalog();

        expect(await selectCatalogRows(filters({ term: payload }))).toEqual([]);
        await expectCatalogIntact();
    });

    it.each(PAYLOADS)("a desenvolvedora %j é só um valor comparado", async (payload) => {
        await seedCatalog();

        expect(await selectCatalogRows(filters({ developerSlugs: [payload] }))).toEqual([]);
        await expectCatalogIntact();
    });

    it.each(PAYLOADS)("o tipo %j é só um valor comparado", async (payload) => {
        await seedCatalog();

        const rows = await selectCatalogRows(filters({ categories: [payload as Category] }));

        expect(rows).toEqual([]);
        await expectCatalogIntact();
    });

    it.each(PAYLOADS)("a ordenação %j cai na relevância", async (payload) => {
        await seedCatalog();

        const rows = await selectCatalogRows(filters({ sort: payload as CatalogSort }));

        expect(rows).toHaveLength(2);
        await expectCatalogIntact();
    });

    it.each(PAYLOADS)("um id %j inválido é recusado pelo banco como uuid", async (payload) => {
        await seedCatalog();

        await expect(selectCatalogRows(filters({ platformIds: [payload] }))).rejects.toThrow();
        await expect(selectCatalogRows(filters({ genreIds: [payload] }))).rejects.toThrow();
        await expectCatalogIntact();
    });

    it("um preço que não é número é recusado pelo banco", async () => {
        await seedCatalog();
        const minPriceCents = "0 OR 1=1" as unknown as number;

        await expect(selectCatalogRows(filters({ minPriceCents }))).rejects.toThrow();
        await expectCatalogIntact();
    });
});

describe("searchCatalog: SQL injection pela URL", () => {
    it.each(PAYLOADS)(
        "a URL com %j em todos os parâmetros não quebra nem altera nada",
        async (payload) => {
            await seedCatalog();

            const page = await search({
                q: payload,
                genre: payload,
                platform: payload,
                developer: payload,
                type: payload,
                min: payload,
                max: payload,
                sort: payload,
                page: payload,
            });

            expect(page.items).toEqual([]);
            await expectCatalogIntact();
        },
    );
});
