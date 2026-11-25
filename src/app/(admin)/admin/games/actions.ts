"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_FACETS_TAG } from "@/app/(store)/catalog/data";
import { productCacheTag } from "@/app/(store)/products/[slug]/data";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
  ValidationError,
} from "@/core/errors";
import { requireAdmin } from "@/core/modules/auth/rbac";
import { parseKeyBatch } from "@/core/modules/key/schema";
import { allocateKeysBatch, type AllocateKeysBatchResult } from "@/core/modules/key/service";
import {
  createProduct,
  createVariant,
  deleteProduct,
  updateProduct,
  updateVariant,
} from "@/core/modules/product/service";
import type { Category, ProductStatus } from "@/generated/prisma/enums";

export type ActionFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type SaveGameInput = {
  category: Category;
  title: string;
  slug?: string;
  description: string;
  developer?: string | null;
  publisher?: string | null;
  coverPath?: string | null;
  baseProductId?: string | null;
  genreIds: string[];
  gallery: { path: string; position: number }[];
  variant: {
    id?: string;
    platformId: string;
    price: number;
    status: ProductStatus;
    releaseDate: string;
  };
  rawKeys?: string;
};

export type CreateGameActionResult =
  | { ok: true; slug: string; keyAllocation?: AllocateKeysBatchResult }
  | ActionFailure;

export type UpdateGameActionResult = { ok: true; slug: string } | ActionFailure;

export type DeleteGameActionResult = { ok: true } | ActionFailure;

export type AllocateKeysActionResult =
  | ({ ok: true } & AllocateKeysBatchResult)
  | ActionFailure;

function mapActionError(error: unknown): ActionFailure {
  if (error instanceof ValidationError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.zodError.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    const firstMessage = error.zodError.issues[0]?.message ?? error.message;
    return { ok: false, message: firstMessage, fieldErrors };
  }

  if (
    error instanceof ConflictError ||
    error instanceof NotFoundError ||
    error instanceof UnprocessableEntityError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError
  ) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Erro inesperado ao processar a operação." };
}

function revalidateCatalogAndAdmin(slug?: string, previousSlug?: string) {
  updateTag(CATALOG_FACETS_TAG);
  revalidatePath("/admin/games");
  if (slug) {
    updateTag(productCacheTag(slug));
    revalidatePath(`/admin/games/${slug}/edit`);
  }
  if (previousSlug && previousSlug !== slug) {
    updateTag(productCacheTag(previousSlug));
    revalidatePath(`/admin/games/${previousSlug}/edit`);
  }
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function createAdminGameAction(
  input: SaveGameInput,
): Promise<CreateGameActionResult> {
  try {
    await requireAdmin();

    const parsedKeys = input.rawKeys ? parseKeyBatch(input.rawKeys) : null;

    const product = await createProduct({
      category: input.category,
      title: input.title,
      slug: input.slug?.trim() ? input.slug.trim() : undefined,
      description: input.description,
      developer: input.developer?.trim() || null,
      publisher: input.publisher?.trim() || null,
      coverPath: input.coverPath?.trim() || null,
      baseProductId:
        input.category === "GAME" ? null : input.baseProductId || null,
      genreIds: input.genreIds,
      gallery: input.gallery,
      variants: [
        {
          platformId: input.variant.platformId,
          price: input.variant.price,
          status: input.variant.status,
          releaseDate: input.variant.releaseDate,
        },
      ],
    });

    let keyAllocation: AllocateKeysBatchResult | undefined;
    const createdVariant = product.variants[0];

    if (createdVariant && parsedKeys && parsedKeys.uniqueKeys.length > 0) {
      const batch = await allocateKeysBatch({
        variantId: createdVariant.id,
        keys: parsedKeys.uniqueKeys,
      });
      keyAllocation = {
        ...batch,
        duplicateKeys: [
          ...parsedKeys.internalDuplicates,
          ...batch.duplicateKeys,
        ],
      };
    }

    revalidateCatalogAndAdmin(product.slug);

    return { ok: true, slug: product.slug, keyAllocation };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updateAdminGameAction(
  currentSlug: string,
  input: SaveGameInput,
): Promise<UpdateGameActionResult> {
  try {
    await requireAdmin();

    const updated = await updateProduct(currentSlug, {
      category: input.category,
      title: input.title,
      slug: input.slug?.trim() ? input.slug.trim() : currentSlug,
      description: input.description,
      developer: input.developer?.trim() || null,
      publisher: input.publisher?.trim() || null,
      coverPath: input.coverPath?.trim() || null,
      baseProductId:
        input.category === "GAME" ? null : input.baseProductId || null,
      genreIds: input.genreIds,
      gallery: input.gallery,
    });

    if (input.variant.id) {
      await updateVariant(updated.slug, input.variant.id, {
        price: input.variant.price,
        status: input.variant.status,
        releaseDate: input.variant.releaseDate,
      });
    } else {
      await createVariant(updated.slug, {
        platformId: input.variant.platformId,
        price: input.variant.price,
        status: input.variant.status,
        releaseDate: input.variant.releaseDate,
      });
    }

    revalidateCatalogAndAdmin(updated.slug, currentSlug);

    return { ok: true, slug: updated.slug };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteAdminGameAction(
  slug: string,
): Promise<DeleteGameActionResult> {
  try {
    await requireAdmin();
    await deleteProduct(slug);
    revalidateCatalogAndAdmin(slug);
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function toggleVariantStatusAction(
  slug: string,
  variantId: string,
  nextStatus: ProductStatus,
): Promise<{ ok: true } | ActionFailure> {
  try {
    await requireAdmin();
    await updateVariant(slug, variantId, { status: nextStatus });
    revalidateCatalogAndAdmin(slug);
    return { ok: true };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function allocateKeysBatchAction(
  variantId: string,
  rawKeys: string,
): Promise<AllocateKeysActionResult> {
  try {
    await requireAdmin();
    const { uniqueKeys, internalDuplicates } = parseKeyBatch(rawKeys);
    const result = await allocateKeysBatch({
      variantId,
      keys: uniqueKeys,
    });

    revalidateCatalogAndAdmin();

    return {
      ok: true,
      insertedCount: result.insertedCount,
      duplicateKeys: [...internalDuplicates, ...result.duplicateKeys],
      totalAvailable: result.totalAvailable,
    };
  } catch (error) {
    return mapActionError(error);
  }
}
