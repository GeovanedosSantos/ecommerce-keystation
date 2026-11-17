/**
 * Tipos da página de produto.
 * - `*Content`: muda pouco e fica no cache (`data.ts`).
 * - `*View` / `VariantPricing`: inclui preço, promoção e estoque do momento, buscados a cada acesso.
 */

export interface Quantity {
  value: number;
  unit: "GB" | "MB";
}

export interface RequirementsBlock {
  os: string;
  processor: string;
  ram: Quantity;
  gpu: string;
  disk_space: Quantity;
}

export interface SystemRequirements {
  minimum: RequirementsBlock;
  recommended: RequirementsBlock;
}

export type ProductCategory = "GAME" | "DLC" | "SPECIAL_EDITION";

export interface PlatformView {
  id: string;
  name: string;
  /** Usado em `?plataforma=` (ex: "playstation"). */
  slug: string;
  hasSystemRequirements: boolean;
}

export interface ProductVariantContent {
  id: string;
  platform: PlatformView;
  /** Data ISO (`YYYY-MM-DD`). */
  releaseDate: string;
}

export interface VariantPricing {
  price: number;
  promotionalPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
}

export interface ProductVariantView extends ProductVariantContent, VariantPricing {}

export interface GalleryItemView {
  id: string;
  path: string;
  position: number;
}

export interface EditionVariantContent {
  id: string;
  platform: { id: string; name: string };
}

/** Outra edição do mesmo jogo: o jogo base ou uma edição especial. */
export interface EditionContent {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  coverPath: string | null;
  developer: string | null;
  variants: EditionVariantContent[];
}

export interface EditionView extends Omit<EditionContent, "variants"> {
  variants: (EditionVariantContent & VariantPricing)[];
}

export interface ProductDetailView {
  id: string;
  slug: string;
  title: string;
  /** Parágrafos separados por linha em branco (`\n\n`). */
  description: string;
  category: ProductCategory;
  developer: string | null;
  publisher: string | null;
  genres: { id: string; name: string }[];
  coverPath: string | null;
  trailerYoutubeId: string | null;
  gallery: GalleryItemView[];
  systemRequirements: SystemRequirements | null;
  variants: ProductVariantView[];
  editions: EditionView[];
}

export type ProductContentView = Omit<ProductDetailView, "variants" | "editions"> & {
  variants: ProductVariantContent[];
  editions: EditionContent[];
};
