import { applyPercentDiscount, toCents } from "@/core/modules/cart/pricing";
import { systemRequirementsSchema } from "@/core/modules/product/schema";
import { slugify } from "@/utils/formatter/slugify";
import type {
  ProductEdition,
  PublishedProduct,
  VariantAvailability,
} from "@/core/modules/product/types";
import type {
  EditionView,
  ProductContentView,
  ProductDetailView,
  ProductVariantView,
  SystemRequirements,
  VariantPricing,
} from "./types";

function toSystemRequirements(value: unknown): SystemRequirements | null {
  const parsed = systemRequirementsSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Conteúdo que vai para o cache: só tipos serializáveis, sem `Decimal` nem `Date`. */
export function toProductContentView(
  product: PublishedProduct,
  editions: ProductEdition[],
): ProductContentView {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    category: product.category,
    developer: product.developer,
    publisher: product.publisher,
    genres: product.genres.map(({ id, name }) => ({ id, name })),
    coverPath: product.coverPath,
    trailerYoutubeId: product.trailerYoutubeId,
    gallery: product.gallery.map(({ id, path, position }) => ({ id, path, position })),
    systemRequirements: toSystemRequirements(product.systemRequirements),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      platform: { ...variant.platform, slug: slugify(variant.platform.name) },
      // Coluna DATE: vem como meia-noite UTC, então a parte da data em ISO é a data gravada.
      releaseDate: variant.releaseDate.toISOString().slice(0, 10),
    })),
    editions: editions.map(({ id, slug, title, category, coverPath, developer, variants }) => ({
      id,
      slug,
      title,
      category,
      coverPath,
      developer,
      variants: variants.map((variant) => ({ id: variant.id, platform: variant.platform })),
    })),
  };
}

export function variantIdsToPrice(content: ProductContentView): string[] {
  return [
    ...content.variants.map(({ id }) => id),
    ...content.editions.flatMap(({ variants }) => variants.map(({ id }) => id)),
  ];
}

function toPricing(current: VariantAvailability): VariantPricing {
  const priceCents = toCents(current.price);
  return {
    price: priceCents / 100,
    // Mesmo cálculo do carrinho, para a página e o checkout mostrarem o mesmo valor.
    promotionalPrice:
      current.discountPercent === null
        ? null
        : applyPercentDiscount(priceCents, current.discountPercent) / 100,
    discountPercent: current.discountPercent,
    inStock: current.inStock,
  };
}

function priced<T extends { id: string }>(
  variants: T[],
  byVariant: Map<string, VariantAvailability>,
): (T & VariantPricing)[] {
  return variants.flatMap((variant) => {
    const current = byVariant.get(variant.id);
    return current ? [{ ...variant, ...toPricing(current) }] : [];
  });
}

/**
 * Junta o conteúdo em cache com o preço do momento. Variants despublicadas depois do cache
 * saem da lista (e edições sem nenhuma); produto sem nenhuma variant devolve `null` (404).
 */
export function withAvailability(
  content: ProductContentView,
  availability: VariantAvailability[],
): ProductDetailView | null {
  const byVariant = new Map(availability.map((item) => [item.variantId, item]));

  const variants: ProductVariantView[] = priced(content.variants, byVariant);
  if (variants.length === 0) return null;

  const editions = content.editions.flatMap((edition): EditionView[] => {
    const editionVariants = priced(edition.variants, byVariant);
    return editionVariants.length > 0 ? [{ ...edition, variants: editionVariants }] : [];
  });

  return { ...content, variants, editions };
}
