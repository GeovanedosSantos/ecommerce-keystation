import { cacheLife, cacheTag } from "next/cache";
import { getCatalogFacets } from "@/core/modules/catalog/service";
import type { CatalogFacets } from "@/core/modules/catalog/types";

/** Invalidar ao criar ou alterar produto, gênero, plataforma ou o status de uma variant. */
export const CATALOG_FACETS_TAG = "catalog:facets";

export async function getCatalogFacetsCached(): Promise<CatalogFacets> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_FACETS_TAG);

  return getCatalogFacets();
}
