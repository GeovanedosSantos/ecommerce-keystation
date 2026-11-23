import { z } from "zod";
import { Category } from "@/generated/prisma/enums";

// Parse tolerante: valor inválido na URL é descartado, nunca gera erro.

export const CATALOG_SORTS = ["relevance", "price-asc", "price-desc", "newest"] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

const CATALOG_TYPES = ["game", "dlc", "special-edition"] as const;
export type CatalogType = (typeof CATALOG_TYPES)[number];

export const CATEGORY_BY_TYPE = {
    game: Category.GAME,
    dlc: Category.DLC,
    "special-edition": Category.SPECIAL_EDITION,
} as const satisfies Record<CatalogType, Category>;

export const TYPE_BY_CATEGORY = {
    [Category.GAME]: "game",
    [Category.DLC]: "dlc",
    [Category.SPECIAL_EDITION]: "special-edition",
} as const satisfies Record<Category, CatalogType>;

export const MAX_SEARCH_LENGTH = 100;
/** Evita que uma URL gigante vire uma query gigante. */
const MAX_VALUES_PER_FILTER = 20;
const MAX_PAGE = 10_000;
const TRUE_VALUES = ["1", "true", "on"];

export type SearchParamsInput = Record<string, string | string[] | undefined>;

const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const asArray = (value: unknown): unknown[] =>
    value === undefined ? [] : Array.isArray(value) ? value : [value];

function listOf<T>(item: z.ZodType<T>) {
    return z.preprocess(asArray, z.array(z.unknown())).transform((values) => {
        const valid = values.flatMap((value) => {
            const parsed = item.safeParse(value);
            return parsed.success ? [parsed.data] : [];
        });
        return [...new Set(valid)].slice(0, MAX_VALUES_PER_FILTER);
    });
}

function optionalOf<T>(item: z.ZodType<T>) {
    return z.preprocess(first, item.optional()).catch(undefined);
}

const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const typeSchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(CATALOG_TYPES))
    .transform((type) => CATEGORY_BY_TYPE[type]);

const searchTermSchema = z
    .string()
    .transform((term) => term.trim().slice(0, MAX_SEARCH_LENGTH).trim())
    .transform((term) => term || undefined);

/** "49.90", "49,9" ou "50" em centavos. */
const priceCentsSchema = z
    .string()
    .trim()
    .regex(/^\d{1,7}(?:[.,]\d{1,2})?$/)
    .transform((price) => Math.round(Number(price.replace(",", ".")) * 100));

const flagSchema = z.preprocess(
    (value) => TRUE_VALUES.includes(String(first(value)).toLowerCase()),
    z.boolean(),
);

export const catalogQuerySchema = z
    .object({
        q: optionalOf(searchTermSchema),
        genre: listOf(slugSchema),
        platform: listOf(slugSchema),
        developer: listOf(slugSchema),
        type: listOf(typeSchema),
        sale: flagSchema,
        min: optionalOf(priceCentsSchema),
        max: optionalOf(priceCentsSchema),
        sort: z.preprocess(first, z.enum(CATALOG_SORTS)).catch("relevance"),
        page: z.preprocess(first, z.coerce.number().int().min(1).max(MAX_PAGE)).catch(1),
    })
    .transform(({ q, genre, platform, developer, type, sale, min, max, sort, page }) => {
        const swap = min !== undefined && max !== undefined && min > max;

        return {
            q,
            genres: genre,
            platforms: platform,
            developers: developer,
            categories: type,
            onSale: sale,
            minPriceCents: swap ? max : min,
            maxPriceCents: swap ? min : max,
            sort,
            page,
        };
    });

export type CatalogQuery = z.output<typeof catalogQuerySchema>;

export function parseCatalogQuery(searchParams: SearchParamsInput): CatalogQuery {
    return catalogQuerySchema.parse(searchParams);
}

export const DEFAULT_CATALOG_QUERY: CatalogQuery = parseCatalogQuery({});

const centsToParam = (cents: number) => String(cents / 100);

export function toCatalogSearchParams(query: CatalogQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.q) params.set("q", query.q);
    query.genres.forEach((slug) => params.append("genre", slug));
    query.platforms.forEach((slug) => params.append("platform", slug));
    query.developers.forEach((slug) => params.append("developer", slug));
    query.categories.forEach((category) => params.append("type", TYPE_BY_CATEGORY[category]));
    if (query.onSale) params.set("sale", "1");
    if (query.minPriceCents !== undefined) params.set("min", centsToParam(query.minPriceCents));
    if (query.maxPriceCents !== undefined) params.set("max", centsToParam(query.maxPriceCents));
    if (query.sort !== DEFAULT_CATALOG_QUERY.sort) params.set("sort", query.sort);
    if (query.page > 1) params.set("page", String(query.page));

    return params;
}
