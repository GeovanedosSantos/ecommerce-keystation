import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { KeyStatus, ProductStatus } from "@/generated/prisma/enums";
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

/**
 * Igual a `productWithVariantsInclude`, mas só com variants publicadas (vitrine pública)
 * e com a contagem de chaves disponíveis, usada para calcular `inStock`.
 */
export const publishedProductInclude = {
    ...productWithVariantsInclude,
    variants: {
        where: { status: ProductStatus.PUBLISHED },
        include: {
            ...variantWithPlatformInclude,
            _count: { select: { keys: { where: { status: KeyStatus.AVAILABLE } } } },
        },
    },
} satisfies Prisma.ProductInclude;

export type VariantWithPlatform = Prisma.ProductVariantGetPayload<{
    include: typeof variantWithPlatformInclude;
}>;

export type ProductWithVariants = Prisma.ProductGetPayload<{
    include: typeof productWithVariantsInclude;
}>;

/** Variant da vitrine: publicada sem chaves disponíveis aparece como esgotada (`inStock: false`). */
export type PublishedVariant = VariantWithPlatform & { inStock: boolean };

export type PublishedProduct = Omit<ProductWithVariants, "variants"> & {
    variants: PublishedVariant[];
};
