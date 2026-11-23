import type { ComponentProps } from "react";
import type { GameCard } from "@/components/GameCard";
import type { CatalogItem } from "@/core/modules/catalog/types";

type GameCardProps = ComponentProps<typeof GameCard>;

export function toGameCard(item: CatalogItem): GameCardProps {
  return {
    id: item.variantId,
    variantId: item.variantId,
    title: item.title,
    slug: item.slug,
    coverImage: item.coverPath ?? "",
    price: item.priceCents / 100,
    promotionalPrice: item.promotionalPriceCents === null ? null : item.promotionalPriceCents / 100,
    developer: item.developer ?? "",
    platform: item.platform.name,
    platformSlug: item.platform.slug,
  };
}
