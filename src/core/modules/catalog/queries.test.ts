import { describe, expect, it } from "vitest";
import { Category } from "@/generated/prisma/enums";
import { catalogPageSql, escapeLike, type CatalogSqlFilters } from "./queries";
import type { CatalogSort } from "./schema";

const INJECTION = "'; DROP TABLE product; --";

const filters = (overrides: Partial<CatalogSqlFilters> = {}): CatalogSqlFilters => ({
    categories: [],
    developerSlugs: [],
    onSale: false,
    sort: "relevance",
    limit: 24,
    offset: 0,
    now: new Date("2026-06-15T12:00:00Z"),
    ...overrides,
});

describe("escapeLike", () => {
    it.each([
        ["100%", "100\\%"],
        ["a_b", "a\\_b"],
        ["c:\\jogos", "c:\\\\jogos"],
        ["elden ring", "elden ring"],
    ])("escapa %j como %j", (term, escaped) => {
        expect(escapeLike(term)).toBe(escaped);
    });
});

describe("catalogPageSql", () => {
    it("envia os valores como parâmetros, nunca dentro do texto do SQL", () => {
        const sql = catalogPageSql(
            filters({
                term: INJECTION,
                developerSlugs: [INJECTION],
                categories: [INJECTION as Category],
                genres: [{ id: INJECTION, slug: INJECTION }],
                platformIds: [INJECTION],
                minPriceCents: 100,
                maxPriceCents: 200,
            }),
        );

        expect(sql.text).not.toContain("DROP TABLE");
        expect(sql.text).toMatch(/search_text LIKE \$\d+/);
        expect(sql.text).toMatch(/developer_slug = ANY\(\$\d+::text\[\]\)/);
        expect(sql.values).toEqual(
            expect.arrayContaining([`%${escapeLike(INJECTION)}%`, [INJECTION], 100, 200]),
        );
    });

    it("todo trecho variável do SQL vira um placeholder", () => {
        const sql = catalogPageSql(filters({ term: "elden", platformIds: [crypto.randomUUID()] }));
        const placeholders = new Set(sql.text.match(/\$\d+/g));

        expect(placeholders.size).toBe(sql.values.length);
    });

    it("uma ordenação fora da lista cai na relevância, sem entrar no SQL", () => {
        const sort = `price-asc; ${INJECTION}` as CatalogSort;
        const sql = catalogPageSql(filters({ sort }));

        expect(sql.text).not.toContain("DROP TABLE");
        expect(sql.text).toContain("ORDER BY title_prefix DESC, sold DESC, release_date DESC");
    });

    it.each(["price-asc", "price-desc", "newest"] as const)(
        "sort=%s não consulta os pedidos",
        (sort) => {
            expect(catalogPageSql(filters({ sort })).text).not.toContain("order_item");
        },
    );

    it.each([
        ["price-asc", "ORDER BY effective_cents ASC"],
        ["price-desc", "ORDER BY effective_cents DESC"],
        ["newest", "ORDER BY release_date DESC"],
    ] as const)("sort=%s ordena por %s", (sort, orderBy) => {
        expect(catalogPageSql(filters({ sort })).text).toContain(orderBy);
    });

    it("só inclui os filtros pedidos", () => {
        const { text } = catalogPageSql(filters());

        expect(text).not.toContain("search_text LIKE");
        expect(text).not.toContain("platform_id = ANY");
        expect(text).not.toContain("_product_genre");
        expect(text).not.toContain("effective_cents >=");
        expect(text).not.toContain("discount_percent IS NOT NULL");
    });

    it("compara a categoria com o enum, sem converter a coluna", () => {
        const { text, values } = catalogPageSql(filters({ categories: [Category.DLC] }));

        expect(text).toMatch(/p\.category = ANY\(\$\d+::category\[\]\)/);
        expect(values).toContainEqual([Category.DLC]);
    });
});
