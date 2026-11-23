import type { Category } from "@/generated/prisma/enums";

export type FacetOption = { id: string; name: string; slug: string };

export type CatalogFacets = {
    genres: FacetOption[];
    platforms: FacetOption[];
    developers: { name: string; slug: string }[];
};

/** Um card do catálogo: uma variant (produto + plataforma) publicada. */
export type CatalogItem = {
    variantId: string;
    productId: string;
    slug: string;
    title: string;
    developer: string | null;
    coverPath: string | null;
    category: Category;
    platform: FacetOption;
    priceCents: number;
    /** Preço com a maior promoção ativa; `null` sem promoção. */
    promotionalPriceCents: number | null;
    discountPercent: number | null;
    inStock: boolean;
    releaseDate: Date;
};

export type CatalogPage = {
    items: CatalogItem[];
    /** 0 quando a página pedida passa da última. */
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
};
