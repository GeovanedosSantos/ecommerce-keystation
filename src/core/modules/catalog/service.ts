import { normalizeSearchText } from "@/utils/formatter/search-text";
import { slugify } from "@/utils/formatter/slugify";
import {
    selectAllGenres,
    selectAllPlatforms,
    countCatalogRows,
    selectCatalogRows,
    selectPublishedDevelopers,
    selectPublishedGenres,
    selectPublishedPlatforms,
    type CatalogRow,
    type CatalogSqlFilters,
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
        developers: developers.flatMap(({ developerSlug, _min }) =>
            developerSlug && _min.developer ? [{ name: _min.developer, slug: developerSlug }] : [],
        ),
    };
}

/**
 * Ids e slug dos registros cujo nome vira um dos slugs pedidos. `undefined` = filtro não pedido;
 * lista vazia = nenhum slug existe, e o resultado é vazio.
 */
async function matchSlugs(
    slugs: string[],
    selectAll: () => Promise<{ id: string; name: string }[]>,
): Promise<{ id: string; slug: string }[] | undefined> {
    if (slugs.length === 0) return undefined;
    const wanted = new Set(slugs);
    return (await selectAll()).map(withSlug).filter(({ slug }) => wanted.has(slug));
}

function toItem(row: CatalogRow): CatalogItem {
    return {
        variantId: row.variant_id,
        slug: row.slug,
        title: row.title,
        developer: row.developer,
        coverPath: row.cover_path,
        platform: { name: row.platform_name, slug: slugify(row.platform_name) },
        priceCents: row.price_cents,
        promotionalPriceCents: row.discount_percent === null ? null : row.effective_cents,
        discountPercent: row.discount_percent,
        inStock: row.in_stock,
    };
}

function toPage(items: CatalogItem[], total: number, page: number): CatalogPage {
    return {
        items,
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
    const [genres, platforms] = await Promise.all([
        matchSlugs(query.genres, selectAllGenres),
        matchSlugs(query.platforms, selectAllPlatforms),
    ]);

    if (genres?.length === 0 || platforms?.length === 0) {
        return toPage([], 0, query.page);
    }

    const filters: CatalogSqlFilters = {
        term: query.q ? normalizeSearchText(query.q) : undefined,
        genres,
        platformIds: platforms?.map(({ id }) => id),
        categories: query.categories,
        developerSlugs: query.developers,
        onSale: query.onSale,
        minPriceCents: query.minPriceCents,
        maxPriceCents: query.maxPriceCents,
        sort: query.sort,
        limit: CATALOG_PAGE_SIZE,
        offset: (query.page - 1) * CATALOG_PAGE_SIZE,
        now,
    };
    const rows = await selectCatalogRows(filters);
    // Além da última página não volta linha nenhuma, e com ela o total: conta à parte.
    const total = rows[0]?.total ?? (query.page > 1 ? await countCatalogRows(filters) : 0);

    return toPage(rows.map(toItem), total, query.page);
}
