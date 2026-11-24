import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createGame, createPlatform, NOW, search } from "@/test/fixtures/catalog";
import { selectCatalogRows, type CatalogSqlFilters } from "./queries";

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
