import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { Category, ProductStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import { normalizeSearchText } from "@/utils/formatter/search-text";
import { slugify } from "@/utils/formatter/slugify";
import type { CatalogQuery } from "./schema";
import type { CatalogFacets, CatalogItem, CatalogPage, FacetOption } from "./types";

export const CATALOG_PAGE_SIZE = 24;

const publishedVariant = { status: ProductStatus.PUBLISHED };

const withSlug = ({ id, name }: { id: string; name: string }): FacetOption => ({
    id,
    name,
    slug: slugify(name),
});

/** Opções dos filtros: só o que tem ao menos uma variant publicada. */
export async function getCatalogFacets(): Promise<CatalogFacets> {
    const [genres, platforms, developers] = await Promise.all([
        prisma.genre.findMany({
            where: { products: { some: { variants: { some: publishedVariant } } } },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        }),
        prisma.platform.findMany({
            where: { variants: { some: publishedVariant } },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        }),
        prisma.product.findMany({
            where: { variants: { some: publishedVariant }, developerSlug: { not: null } },
            distinct: ["developerSlug"],
            orderBy: { developerSlug: "asc" },
            select: { developer: true, developerSlug: true },
        }),
    ]);

    return {
        genres: genres.map(withSlug),
        platforms: platforms.map(withSlug),
        developers: developers.flatMap(({ developer, developerSlug }) =>
            developer && developerSlug ? [{ name: developer, slug: developerSlug }] : [],
        ),
    };
}

/**
 * Ids cujo nome vira um dos slugs pedidos. `undefined` = filtro não pedido;
 * lista vazia = nenhum slug existe, e o resultado é vazio.
 */
async function idsBySlug(
    slugs: string[],
    findAll: () => Promise<{ id: string; name: string }[]>,
): Promise<string[] | undefined> {
    if (slugs.length === 0) return undefined;
    const wanted = new Set(slugs);
    return (await findAll()).filter(({ name }) => wanted.has(slugify(name))).map(({ id }) => id);
}

const escapeLike = (term: string) => term.replace(/[\\%_]/g, (char) => `\\${char}`);

const rowSchema = z.object({
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

function toItem(row: z.infer<typeof rowSchema>): CatalogItem {
    return {
        variantId: row.variant_id,
        productId: row.product_id,
        slug: row.slug,
        title: row.title,
        developer: row.developer,
        coverPath: row.cover_path,
        category: row.category,
        platform: withSlug({ id: row.platform_id, name: row.platform_name }),
        priceCents: row.price_cents,
        promotionalPriceCents: row.discount_percent === null ? null : row.effective_cents,
        discountPercent: row.discount_percent,
        inStock: row.in_stock,
        releaseDate: row.release_date,
    };
}

const emptyPage = (page: number): CatalogPage => ({
    items: [],
    total: 0,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    pageCount: 0,
});

/**
 * Busca, filtra, ordena e pagina as variants publicadas. Preço, oferta e ordenação usam o
 * preço efetivo em `now` (maior promoção ativa), com o mesmo arredondamento do carrinho.
 */
export async function searchCatalog(
    query: CatalogQuery,
    now: Date = new Date(),
): Promise<CatalogPage> {
    const [genreIds, platformIds] = await Promise.all([
        idsBySlug(query.genres, () => prisma.genre.findMany({ select: { id: true, name: true } })),
        idsBySlug(query.platforms, () =>
            prisma.platform.findMany({ select: { id: true, name: true } }),
        ),
    ]);

    if (genreIds?.length === 0 || platformIds?.length === 0) {
        return emptyPage(query.page);
    }

    const term = query.q ? normalizeSearchText(query.q) : "";
    const byRelevance = query.sort === "relevance";

    const where: Prisma.Sql[] = [Prisma.sql`v.status = 'PUBLISHED'`];
    if (term) where.push(Prisma.sql`p.search_text LIKE ${`%${escapeLike(term)}%`}`);
    if (platformIds) where.push(Prisma.sql`v.platform_id = ANY(${platformIds}::uuid[])`);
    if (query.categories.length > 0) {
        where.push(Prisma.sql`p.category::text = ANY(${query.categories}::text[])`);
    }
    if (query.developers.length > 0) {
        where.push(Prisma.sql`p.developer_slug = ANY(${query.developers}::text[])`);
    }
    if (genreIds) {
        where.push(Prisma.sql`EXISTS (
            SELECT 1 FROM "_product_genre" pg WHERE pg."B" = p.id AND pg."A" = ANY(${genreIds}::uuid[])
        )`);
    }

    const having: Prisma.Sql[] = [Prisma.sql`TRUE`];
    if (query.onSale) having.push(Prisma.sql`discount_percent IS NOT NULL`);
    if (query.minPriceCents !== undefined) {
        having.push(Prisma.sql`effective_cents >= ${query.minPriceCents}`);
    }
    if (query.maxPriceCents !== undefined) {
        having.push(Prisma.sql`effective_cents <= ${query.maxPriceCents}`);
    }

    const orderBy = {
        relevance: term
            ? Prisma.sql`title_prefix DESC, sold DESC, release_date DESC`
            : Prisma.sql`sold DESC, release_date DESC`,
        "price-asc": Prisma.sql`effective_cents ASC`,
        "price-desc": Prisma.sql`effective_cents DESC`,
        newest: Prisma.sql`release_date DESC`,
    }[query.sort];

    const rows = await prisma.$queryRaw<unknown[]>`
        WITH active_promo AS (
            SELECT pp.variant_id, MAX(pp.discount_percent)::int AS discount_percent
            FROM promotion_product pp
            JOIN promotion pr ON pr.id = pp.promotion_id
            WHERE pr.is_active AND pr.starts_at <= ${now} AND pr.ends_at >= ${now}
            GROUP BY pp.variant_id
        ),
        sales AS (
            SELECT oi.variant_id, COUNT(*)::int AS sold
            FROM order_item oi
            JOIN "order" o ON o.id = oi.order_id
            WHERE ${byRelevance} AND o.status = 'PAID'
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
                ${term ? Prisma.sql`p.search_text LIKE ${`${escapeLike(term)}%`}` : Prisma.sql`FALSE`} AS title_prefix
            FROM product_variant v
            JOIN product p ON p.id = v.product_id
            JOIN platform pl ON pl.id = v.platform_id
            LEFT JOIN active_promo ap ON ap.variant_id = v.id
            LEFT JOIN sales s ON s.variant_id = v.id
            WHERE ${Prisma.join(where, " AND ")}
        )
        SELECT *, COUNT(*) OVER()::int AS total
        FROM listing
        WHERE ${Prisma.join(having, " AND ")}
        ORDER BY ${orderBy}, title ASC, variant_id ASC
        LIMIT ${CATALOG_PAGE_SIZE} OFFSET ${(query.page - 1) * CATALOG_PAGE_SIZE}
    `;

    const parsed = z.array(rowSchema).parse(rows);
    const total = parsed[0]?.total ?? 0;

    return {
        items: parsed.map(toItem),
        total,
        page: query.page,
        pageSize: CATALOG_PAGE_SIZE,
        pageCount: Math.ceil(total / CATALOG_PAGE_SIZE),
    };
}
