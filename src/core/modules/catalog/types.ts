export type FacetOption = { id: string; name: string; slug: string };

export type CatalogFacets = {
    genres: FacetOption[];
    platforms: FacetOption[];
    developers: { name: string; slug: string }[];
};

/** Um card do catálogo: uma variant (produto + plataforma) publicada. */
export type CatalogItem = {
    variantId: string;
    slug: string;
    title: string;
    developer: string | null;
    coverPath: string | null;
    platform: { name: string; slug: string };
    priceCents: number;
    /** Preço com a maior promoção ativa; `null` sem promoção. */
    promotionalPriceCents: number | null;
    discountPercent: number | null;
    /** Tem ao menos uma chave disponível. Ainda não aparece no card. */
    inStock: boolean;
};

export type CatalogPage = {
    items: CatalogItem[];
    /** Total de resultados, mesmo quando a página pedida passa da última e `items` vem vazio. */
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
};
