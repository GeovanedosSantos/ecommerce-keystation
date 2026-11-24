import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { Category } from "@/generated/prisma/enums";
import { ProductStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import type { CatalogSort } from "./schema";

/**
 * Acesso ao banco do catálogo. Todo valor entra no SQL como parâmetro (`$1`, `$2`...) pelo
 * `Prisma.sql`; o texto da query só recebe trechos fixos escritos neste arquivo.
 */

export type CatalogSqlFilters = {
    /** Já normalizado (`normalizeSearchText`). */
    term?: string;
    /**
     * Gêneros pedidos, com o slug de cada id. O produto precisa ter ao menos um id de cada slug:
     * dois gêneros com o mesmo slug ("Ação" e "Acao") valem como um só.
     */
    genres?: { id: string; slug: string }[];
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
    slug: z.string(),
    title: z.string(),
    developer: z.string().nullable(),
    cover_path: z.string().nullable(),
    platform_name: z.string(),
    price_cents: z.number().int(),
    effective_cents: z.number().int(),
    discount_percent: z.number().int().nullable(),
    in_stock: z.boolean(),
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
        conditions.push(Prisma.sql`p.category = ANY(${filters.categories}::category[])`);
    }
    if (filters.developerSlugs.length > 0) {
        conditions.push(Prisma.sql`p.developer_slug = ANY(${filters.developerSlugs}::text[])`);
    }
    if (filters.genres) {
        const ids = filters.genres.map(({ id }) => id);
        const slugs = filters.genres.map(({ slug }) => slug);
        // Nenhum slug pedido pode faltar no produto.
        conditions.push(Prisma.sql`(
            SELECT COUNT(DISTINCT wanted.slug)
            FROM unnest(${ids}::uuid[], ${slugs}::text[]) AS wanted(id, slug)
            JOIN "_product_genre" pg ON pg."A" = wanted.id
            WHERE pg."B" = p.id
        ) = ${new Set(slugs).size}`);
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
 * Variants que passam nos filtros (CTE `listing`, sem os filtros de preço). O preço efetivo usa a
 * maior promoção ativa em `now`, com o mesmo arredondamento de `applyPercentDiscount`.
 */
function listingSql(filters: CatalogSqlFilters, sort: CatalogSort): Prisma.Sql {
    const titlePrefix = filters.term
        ? Prisma.sql`p.search_text LIKE ${`${escapeLike(filters.term)}%`}`
        : Prisma.sql`FALSE`;
    // Só a relevância usa as vendas. A contagem fica presa a `v.id`, então só olha os pedidos
    // das variants que passaram no filtro, e item reembolsado não conta como venda.
    const sold =
        sort === "relevance"
            ? Prisma.sql`(
                SELECT COUNT(*)::int
                FROM order_item oi
                JOIN "order" o ON o.id = oi.order_id
                WHERE oi.variant_id = v.id AND o.status = 'PAID' AND oi.status <> 'REFUNDED'
            )`
            : Prisma.sql`0`;

    return Prisma.sql`
        WITH active_promo AS (
            SELECT pp.variant_id, MAX(pp.discount_percent)::int AS discount_percent
            FROM promotion_product pp
            JOIN promotion pr ON pr.id = pp.promotion_id
            WHERE pr.is_active AND pr.starts_at <= ${filters.now} AND pr.ends_at >= ${filters.now}
            GROUP BY pp.variant_id
        ),
        listing AS (
            SELECT
                v.id::text AS variant_id,
                p.slug,
                p.title,
                p.developer,
                p.cover_path,
                pl.name AS platform_name,
                ROUND(v.price * 100)::int AS price_cents,
                ROUND(v.price * (100 - COALESCE(ap.discount_percent, 0)))::int AS effective_cents,
                ap.discount_percent,
                v.release_date,
                ${sold} AS sold,
                ${titlePrefix} AS title_prefix
            FROM product_variant v
            JOIN product p ON p.id = v.product_id
            JOIN platform pl ON pl.id = v.platform_id
            LEFT JOIN active_promo ap ON ap.variant_id = v.id
            WHERE ${variantConditions(filters)}
        )
    `;
}

/** Uma ordenação fora da lista nunca chega ao SQL: cai na relevância. */
const resolveSort = (sort: CatalogSort): CatalogSort =>
    Object.hasOwn(ORDER_BY, sort) ? sort : "relevance";

/**
 * A página pedida, com o total de resultados em cada linha. O estoque é consultado depois do
 * LIMIT, só para as linhas da página: o `COUNT(*) OVER()` monta todas as linhas filtradas, e
 * dentro de `listing` ele seria calculado para cada uma.
 */
export function catalogPageSql(filters: CatalogSqlFilters): Prisma.Sql {
    const sort = resolveSort(filters.sort);
    const orderBy = Prisma.sql`ORDER BY ${ORDER_BY[sort]}, title ASC, variant_id ASC`;

    return Prisma.sql`
        ${listingSql(filters, sort)},
        page AS (
            SELECT *, COUNT(*) OVER()::int AS total
            FROM listing
            WHERE ${priceConditions(filters)}
            ${orderBy}
            LIMIT ${filters.limit} OFFSET ${filters.offset}
        )
        SELECT
            variant_id, slug, title, developer, cover_path, platform_name,
            price_cents, effective_cents, discount_percent, total,
            EXISTS (
                SELECT 1 FROM "key" k
                WHERE k.variant_id = page.variant_id::uuid AND k.status = 'AVAILABLE'
            ) AS in_stock
        FROM page
        ${orderBy}
    `;
}

/** Só o total, para quando a página pedida passa da última e não volta nenhuma linha. */
export function catalogCountSql(filters: CatalogSqlFilters): Prisma.Sql {
    return Prisma.sql`
        ${listingSql(filters, "price-asc")}
        SELECT COUNT(*)::int AS total FROM listing WHERE ${priceConditions(filters)}
    `;
}

/** Executa a query e valida cada linha: o resultado tem o tipo de `CatalogRow` de fato. */
export async function selectCatalogRows(filters: CatalogSqlFilters): Promise<CatalogRow[]> {
    const rows = await prisma.$queryRaw<unknown[]>(catalogPageSql(filters));
    return z.array(catalogRowSchema).parse(rows);
}

export async function countCatalogRows(filters: CatalogSqlFilters): Promise<number> {
    const rows = await prisma.$queryRaw<unknown[]>(catalogCountSql(filters));
    return z.tuple([z.object({ total: z.number().int() })]).parse(rows)[0].total;
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

/** Uma linha por slug, agrupada no banco; o nome mostrado é o menor entre os do mesmo slug. */
export const selectPublishedDevelopers = () =>
    prisma.product.groupBy({
        by: ["developerSlug"],
        where: { variants: { some: publishedVariant }, developerSlug: { not: null } },
        _min: { developer: true },
        orderBy: { developerSlug: "asc" },
    });
