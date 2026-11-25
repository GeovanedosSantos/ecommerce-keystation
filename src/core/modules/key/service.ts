import { KeyStatus } from "@/generated/prisma/enums";
import { NotFoundError, parseOrThrow } from "@/core/errors";
import { prisma } from "@/infra/prisma";
import { allocateKeysBatchSchema } from "./schema";

export type AllocateKeysBatchResult = {
  insertedCount: number;
  duplicateKeys: string[];
  totalAvailable: number;
};

export type VariantKeyStats = {
  available: number;
  reserved: number;
  sold: number;
};

/**
 * Aloca um lote de chaves digitais para uma `ProductVariant`.
 * Chaves repetidas dentro do lote ou já existentes no banco são ignoradas e retornadas em `duplicateKeys`.
 */
export async function allocateKeysBatch(
  payload: unknown,
): Promise<AllocateKeysBatchResult> {
  const { variantId, keys } = parseOrThrow(allocateKeysBatchSchema, payload);

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true },
  });

  if (!variant) {
    throw new NotFoundError(`Variant "${variantId}" não encontrada`);
  }

  const seen = new Set<string>();
  const uniqueKeys: string[] = [];
  const duplicateKeys: string[] = [];

  for (const key of keys) {
    if (seen.has(key)) {
      duplicateKeys.push(key);
    } else {
      seen.add(key);
      uniqueKeys.push(key);
    }
  }

  const existing = await prisma.key.findMany({
    where: { keyCode: { in: uniqueKeys } },
    select: { keyCode: true },
  });

  const existingSet = new Set(existing.map((item) => item.keyCode));
  const newKeys: string[] = [];

  for (const key of uniqueKeys) {
    if (existingSet.has(key)) {
      duplicateKeys.push(key);
    } else {
      newKeys.push(key);
    }
  }

  let insertedCount = 0;
  if (newKeys.length > 0) {
    const created = await prisma.key.createMany({
      data: newKeys.map((keyCode) => ({
        variantId,
        keyCode,
        status: KeyStatus.AVAILABLE,
      })),
      skipDuplicates: true,
    });
    insertedCount = created.count;
  }

  const totalAvailable = await prisma.key.count({
    where: { variantId, status: KeyStatus.AVAILABLE },
  });

  return {
    insertedCount,
    duplicateKeys,
    totalAvailable,
  };
}

/** Retorna a contagem de chaves da variant agrupada por status. */
export async function getVariantKeyStats(
  variantId: string,
): Promise<VariantKeyStats> {
  const grouped = await prisma.key.groupBy({
    by: ["status"],
    where: { variantId },
    _count: { _all: true },
  });

  const stats: VariantKeyStats = { available: 0, reserved: 0, sold: 0 };

  for (const row of grouped) {
    if (row.status === KeyStatus.AVAILABLE) stats.available = row._count._all;
    else if (row.status === KeyStatus.RESERVED) stats.reserved = row._count._all;
    else if (row.status === KeyStatus.SOLD) stats.sold = row._count._all;
  }

  return stats;
}
