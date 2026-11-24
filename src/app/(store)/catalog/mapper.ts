import type { ComponentProps } from "react";
import type { GameCard } from "@/components/GameCard";
import type { CatalogItem, CatalogPage } from "@/core/modules/catalog/types";

type GameCardProps = ComponentProps<typeof GameCard>;

const count = new Intl.NumberFormat("pt-BR");

/** "8 resultados", ou "Mostrando 25–30 de 30 resultados" quando há mais de uma página. */
export function toResultsLabel({ items, total, page, pageSize }: CatalogPage): string {
  const noun = total === 1 ? "resultado" : "resultados";
  if (items.length === total) return `${count.format(total)} ${noun}`;

  const first = (page - 1) * pageSize + 1;
  const last = first + items.length - 1;
  return `Mostrando ${count.format(first)}–${count.format(last)} de ${count.format(total)} ${noun}`;
}

export function toGameCard(item: CatalogItem, inCart: boolean): GameCardProps {
  return {
    id: item.variantId,
    variantId: item.variantId,
    title: item.title,
    slug: item.slug,
    coverImage: item.coverPath ?? "",
    price: item.priceCents / 100,
    promotionalPrice: item.promotionalPriceCents === null ? null : item.promotionalPriceCents / 100,
    discountPercent: item.discountPercent,
    developer: item.developer ?? "",
    platform: item.platform.name,
    platformSlug: item.platform.slug,
    inCart,
  };
}
