import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { ProductStatus } from "@/generated/prisma/enums";
import type { updateProductSchema } from "./schema";

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const variantWithPlatformInclude = {
    platform: { select: { id: true, name: true, hasSystemRequirements: true } },
} satisfies Prisma.ProductVariantInclude;

export const productWithVariantsInclude = {
    variants: { include: variantWithPlatformInclude },
    genres: true,
    gallery: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

/** Vitrine: só variants publicadas. Preço, promoção e estoque vêm de `getVariantsAvailability`. */
export const publishedProductInclude = {
    ...productWithVariantsInclude,
    variants: {
        where: { status: ProductStatus.PUBLISHED },
        orderBy: { platform: { name: "asc" } },
        include: variantWithPlatformInclude,
    },
} satisfies Prisma.ProductInclude;

export type VariantWithPlatform = Prisma.ProductVariantGetPayload<{
    include: typeof variantWithPlatformInclude;
}>;

export type ProductWithVariants = Prisma.ProductGetPayload<{
    include: typeof productWithVariantsInclude;
}>;

export type PublishedProduct = Prisma.ProductGetPayload<{
    include: typeof publishedProductInclude;
}>;

/**
 * Dados de uma variant que mudam a cada acesso. `discountPercent` é o maior desconto entre
 * as promoções ativas agora (ou `null`); `inStock` é `false` sem chaves disponíveis (esgotada).
 */
export type VariantAvailability = {
    variantId: string;
    price: Prisma.Decimal;
    discountPercent: number | null;
    inStock: boolean;
};

/** Card de "Outras edições". O preço das variants vem de `getVariantsAvailability`. */
export const editionSelect = {
    id: true,
    slug: true,
    title: true,
    category: true,
    coverPath: true,
    developer: true,
    variants: {
        where: { status: ProductStatus.PUBLISHED },
        orderBy: { platform: { name: "asc" } },
        select: { id: true, platform: { select: { id: true, name: true } } },
    },
} satisfies Prisma.ProductSelect;

export type ProductEdition = Prisma.ProductGetPayload<{ select: typeof editionSelect }>;
