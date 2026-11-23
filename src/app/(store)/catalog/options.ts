import type { CatalogSort, CatalogType } from "@/core/modules/catalog/schema";
import { slugify } from "@/utils/formatter/slugify";

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

const toOptions = (names: string[]): FilterOption[] => names.map((name) => ({ slug: slugify(name), name }));

// TODO(Parte 2): trocar pelas facetas do banco (getCatalogFacets).
export const STATIC_FILTER_OPTIONS: CatalogFilterOptions = {
  genres: toOptions(["Ação", "RPG", "Mundo Aberto", "Soulslike", "Corrida", "Estratégia", "Indie"]),
  platforms: toOptions(["Steam", "PlayStation", "Xbox"]),
  developers: [],
};
