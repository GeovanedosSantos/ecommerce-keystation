import { toCatalogSearchParams, type CatalogQuery } from "@/core/modules/catalog/schema";

export const CATALOG_PATH = "/catalog";

/** Aplica as mudanças e volta para a página 1, a não ser que `changes` traga a página. */
export const withChanges = (query: CatalogQuery, changes: Partial<CatalogQuery>): CatalogQuery => ({
  ...query,
  page: 1,
  ...changes,
});

/** A URL exata da consulta, sem mexer na página. */
export function catalogUrl(query: CatalogQuery): string {
  const search = toCatalogSearchParams(query).toString();
  return search ? `${CATALOG_PATH}?${search}` : CATALOG_PATH;
}

export const catalogHref = (query: CatalogQuery, changes: Partial<CatalogQuery> = {}): string =>
  catalogUrl(withChanges(query, changes));
