import { normalizeSearchText } from "@/utils/formatter/search-text";
import { slugify } from "@/utils/formatter/slugify";
import {
    selectAllGenres,
    selectAllPlatforms,
    selectCatalogRows,
    selectPublishedDevelopers,
    selectPublishedGenres,
    selectPublishedPlatforms,
    type CatalogRow,
} from "./queries";
import type { CatalogQuery } from "./schema";
import type { CatalogFacets, CatalogItem, CatalogPage, FacetOption } from "./types";

export const CATALOG_PAGE_SIZE = 24;

const withSlug = ({ id, name }: { id: string; name: string }): FacetOption => ({
    id,
    name,
    slug: slugify(name),
});

/** Opções dos filtros: só o que tem ao menos uma variant publicada. */
export async function getCatalogFacets(): Promise<CatalogFacets> {
    const [genres, platforms, developers] = await Promise.all([
        selectPublishedGenres(),
        selectPublishedPlatforms(),
        selectPublishedDevelopers(),
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
    selectAll: () => Promise<{ id: string; name: string }[]>,
): Promise<string[] | undefined> {
    if (slugs.length === 0) return undefined;
    const wanted = new Set(slugs);
    return (await selectAll()).filter(({ name }) => wanted.has(slugify(name))).map(({ id }) => id);
}

function toItem(row: CatalogRow): CatalogItem {
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

function toPage(rows: CatalogRow[], page: number): CatalogPage {
    const total = rows[0]?.total ?? 0;
    return {
        items: rows.map(toItem),
        total,
        page,
        pageSize: CATALOG_PAGE_SIZE,
        pageCount: Math.ceil(total / CATALOG_PAGE_SIZE),
    };
}

/**
 * Busca, filtra, ordena e pagina as variants publicadas. Preço, oferta e ordenação usam o
 * preço efetivo em `now` (maior promoção ativa), com o mesmo arredondamento do carrinho.
 */
export async function searchCatalog(
    query: CatalogQuery,
    now: Date = new Date(),
): Promise<CatalogPage> {
    const [genreIds, platformIds] = await Promise.all([
        idsBySlug(query.genres, selectAllGenres),
        idsBySlug(query.platforms, selectAllPlatforms),
    ]);

    if (genreIds?.length === 0 || platformIds?.length === 0) {
        return toPage([], query.page);
    }

    const rows = await selectCatalogRows({
        term: query.q ? normalizeSearchText(query.q) : undefined,
        genreIds,
        platformIds,
        categories: query.categories,
        developerSlugs: query.developers,
        onSale: query.onSale,
        minPriceCents: query.minPriceCents,
        maxPriceCents: query.maxPriceCents,
        sort: query.sort,
        limit: CATALOG_PAGE_SIZE,
        offset: (query.page - 1) * CATALOG_PAGE_SIZE,
        now,
    });

    return toPage(rows, query.page);
}
