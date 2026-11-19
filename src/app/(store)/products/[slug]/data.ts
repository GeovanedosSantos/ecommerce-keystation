import { cacheLife, cacheTag } from "next/cache";
import { NotFoundError } from "@/core/errors";
import { getPublishedEditions, getPublishedProductBySlug } from "@/core/modules/product/service";
import { toProductContentView } from "./mapper";
import type { ProductContentView } from "./types";

export const productCacheTag = (slug: string) => `product:${slug}`;

export async function getProductContent(slug: string): Promise<ProductContentView | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(productCacheTag(slug));

  const product = await getPublishedProductBySlug(slug).catch((error: unknown) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });
  if (!product) return null;

  // Mudar uma edição exige invalidar também a tag do jogo base e das outras edições.
  const editions = await getPublishedEditions(product);
  return toProductContentView(product, editions);
}
