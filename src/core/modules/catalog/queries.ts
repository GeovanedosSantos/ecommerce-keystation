import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { Category, ProductStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import type { CatalogSort } from "./schema";

/**
 * Acesso ao banco do catálogo. Todo valor entra no SQL como parâmetro (`$1`, `$2`...) pelo
 * `Prisma.sql`; o texto da query só recebe trechos fixos escritos neste arquivo.
 */

export type CatalogSqlFilters = {
    /** Já normalizado (`normalizeSearchText`). */
    term?: string;
    genreIds?: string[];
    platformIds?: string[];
    categories: Category[];
    developerSlugs: string[];
    onSale: boolean;
    minPriceCents?: number;
    maxPriceCents?: number;
    sort: CatalogSort;
    limit: number;
    offset: number;
    now: Date;
};

const catalogRowSchema = z.object({
    variant_id: z.string(),
    product_id: z.string(),
    slug: z.string(),
    title: z.string(),
    developer: z.string().nullable(),
    cover_path: z.string().nullable(),
    category: z.enum(Category),
    platform_id: z.string(),
    platform_name: z.string(),
    price_cents: z.number().int(),
    effective_cents: z.number().int(),
    discount_percent: z.number().int().nullable(),
    in_stock: z.boolean(),
    release_date: z.date(),
    total: z.number().int(),
});

export type CatalogRow = z.infer<typeof catalogRowSchema>;

/** Sem `\`, `%` e `_` com significado: o termo é comparado como texto. */
export const escapeLike = (term: string) => term.replace(/[\\%_]/g, (char) => `\\${char}`);

const ORDER_BY: Record<CatalogSort, Prisma.Sql> = {
    relevance: Prisma.sql`title_prefix DESC, sold DESC, release_date DESC`,
    "price-asc": Prisma.sql`effective_cents ASC`,
    "price-desc": Prisma.sql`effective_cents DESC`,
    newest: Prisma.sql`release_date DESC`,
};

function variantConditions(filters: CatalogSqlFilters): Prisma.Sql {
    const conditions = [Prisma.sql`v.status = 'PUBLISHED'`];

    if (filters.term) {
        conditions.push(Prisma.sql`p.search_text LIKE ${`%${escapeLike(filters.term)}%`}`);
    }
    if (filters.platformIds) {
        conditions.push(Prisma.sql`v.platform_id = ANY(${filters.platformIds}::uuid[])`);
    }
    if (filters.categories.length > 0) {
        conditions.push(Prisma.sql`p.category::text = ANY(${filters.categories}::text[])`);
    }
    if (filters.developerSlugs.length > 0) {
        conditions.push(Prisma.sql`p.developer_slug = ANY(${filters.developerSlugs}::text[])`);
    }
    if (filters.genreIds) {
        conditions.push(Prisma.sql`EXISTS (
            SELECT 1 FROM "_product_genre" pg
            WHERE pg."B" = p.id AND pg."A" = ANY(${filters.genreIds}::uuid[])
        )`);
    }

    return Prisma.join(conditions, " AND ");
}

function priceConditions(filters: CatalogSqlFilters): Prisma.Sql {
    const conditions = [Prisma.sql`TRUE`];

    if (filters.onSale) conditions.push(Prisma.sql`discount_percent IS NOT NULL`);
    if (filters.minPriceCents !== undefined) {
        conditions.push(Prisma.sql`effective_cents >= ${filters.minPriceCents}`);
    }
    if (filters.maxPriceCents !== undefined) {
        conditions.push(Prisma.sql`effective_cents <= ${filters.maxPriceCents}`);
    }

    return Prisma.join(conditions, " AND ");
}

/**
 * Monta a query da página do catálogo. O preço efetivo usa a maior promoção ativa em `now`,
 * com o mesmo arredondamento de `applyPercentDiscount`.
 */
export function catalogPageSql(filters: CatalogSqlFilters): Prisma.Sql {
    const titlePrefix = filters.term
        ? Prisma.sql`p.search_text LIKE ${`${escapeLike(filters.term)}%`}`
        : Prisma.sql`FALSE`;
    // Uma ordenação fora da lista nunca chega ao SQL: cai na relevância.
    const orderBy = ORDER_BY[filters.sort] ?? ORDER_BY.relevance;

    return Prisma.sql`
        WITH active_promo AS (
            SELECT pp.variant_id, MAX(pp.discount_percent)::int AS discount_percent
            FROM promotion_product pp
            JOIN promotion pr ON pr.id = pp.promotion_id
            WHERE pr.is_active AND pr.starts_at <= ${filters.now} AND pr.ends_at >= ${filters.now}
            GROUP BY pp.variant_id
        ),
        sales AS (
            SELECT oi.variant_id, COUNT(*)::int AS sold
            FROM order_item oi
            JOIN "order" o ON o.id = oi.order_id
            WHERE ${filters.sort === "relevance"} AND o.status = 'PAID'
            GROUP BY oi.variant_id
        ),
        listing AS (
            SELECT
                v.id::text AS variant_id,
                p.id::text AS product_id,
                p.slug,
                p.title,
                p.developer,
                p.cover_path,
                p.category::text AS category,
                pl.id::text AS platform_id,
                pl.name AS platform_name,
                ROUND(v.price * 100)::int AS price_cents,
                ROUND(v.price * (100 - COALESCE(ap.discount_percent, 0)))::int AS effective_cents,
                ap.discount_percent,
                EXISTS (
                    SELECT 1 FROM "key" k WHERE k.variant_id = v.id AND k.status = 'AVAILABLE'
                ) AS in_stock,
                v.release_date,
                COALESCE(s.sold, 0) AS sold,
                ${titlePrefix} AS title_prefix
            FROM product_variant v
            JOIN product p ON p.id = v.product_id
            JOIN platform pl ON pl.id = v.platform_id
            LEFT JOIN active_promo ap ON ap.variant_id = v.id
            LEFT JOIN sales s ON s.variant_id = v.id
            WHERE ${variantConditions(filters)}
        )
        SELECT *, COUNT(*) OVER()::int AS total
        FROM listing
        WHERE ${priceConditions(filters)}
        ORDER BY ${orderBy}, title ASC, variant_id ASC
        LIMIT ${filters.limit} OFFSET ${filters.offset}
    `;
}

/** Executa a query e valida cada linha: o resultado tem o tipo de `CatalogRow` de fato. */
export async function selectCatalogRows(filters: CatalogSqlFilters): Promise<CatalogRow[]> {
    const rows = await prisma.$queryRaw<unknown[]>(catalogPageSql(filters));
    return z.array(catalogRowSchema).parse(rows);
}

const publishedVariant = { status: ProductStatus.PUBLISHED };
const idAndName = { id: true, name: true } as const;

export const selectAllGenres = () => prisma.genre.findMany({ select: idAndName });
export const selectAllPlatforms = () => prisma.platform.findMany({ select: idAndName });

export const selectPublishedGenres = () =>
    prisma.genre.findMany({
        where: { products: { some: { variants: { some: publishedVariant } } } },
        orderBy: { name: "asc" },
        select: idAndName,
    });

export const selectPublishedPlatforms = () =>
    prisma.platform.findMany({
        where: { variants: { some: publishedVariant } },
        orderBy: { name: "asc" },
        select: idAndName,
    });

export const selectPublishedDevelopers = () =>
    prisma.product.findMany({
        where: { variants: { some: publishedVariant }, developerSlug: { not: null } },
        distinct: ["developerSlug"],
        orderBy: { developerSlug: "asc" },
        select: { developer: true, developerSlug: true },
    });
