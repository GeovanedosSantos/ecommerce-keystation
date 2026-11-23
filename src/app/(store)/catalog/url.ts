import { toCatalogSearchParams, type CatalogQuery } from "@/core/modules/catalog/schema";

export const CATALOG_PATH = "/catalog";

/** Volta para a página 1, a não ser que `changes` traga a página. */
export function catalogHref(query: CatalogQuery, changes: Partial<CatalogQuery> = {}): string {
  const params = toCatalogSearchParams({ ...query, page: 1, ...changes });
  const search = params.toString();
  return search ? `${CATALOG_PATH}?${search}` : CATALOG_PATH;
}
