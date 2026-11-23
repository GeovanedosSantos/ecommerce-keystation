import type { CatalogSort, CatalogType } from "@/core/modules/catalog/schema";

export type FilterOption = { slug: string; name: string };

export type CatalogFilterOptions = {
  genres: FilterOption[];
  platforms: FilterOption[];
  developers: FilterOption[];
};

export const SORT_LABEL: Record<CatalogSort, string> = {
  relevance: "Mais relevantes",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  newest: "Lançamentos",
};

export const TYPE_OPTIONS: { slug: CatalogType; name: string }[] = [
  { slug: "game", name: "Jogos" },
  { slug: "dlc", name: "DLCs" },
  { slug: "special-edition", name: "Edições especiais" },
];
