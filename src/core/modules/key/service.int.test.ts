import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NotFoundError, ValidationError } from "@/core/errors";
import { KeyStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { allocateKeysBatch, getVariantKeyStats } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

async function createSampleVariant() {
  const platform = await prisma.platform.create({
    data: { name: "Steam", hasSystemRequirements: true },
  });

  const product = await prisma.product.create({
    data: {
      category: "GAME",
      title: "Hades",
      slug: "hades",
      description: "Roguelike",
    },
  });

  return prisma.productVariant.create({
    data: {
      productId: product.id,
      platformId: platform.id,
      price: "49.90",
      status: "PUBLISHED",
      releaseDate: new Date("2026-01-01"),
    },
  });
}

describe("allocateKeysBatch", () => {
  it("insere lote de chaves inéditas como AVAILABLE", async () => {
    const variant = await createSampleVariant();

    const result = await allocateKeysBatch({
      variantId: variant.id,
      keys: ["KEY-001", "KEY-002", "KEY-003"],
    });

    expect(result).toEqual({
      insertedCount: 3,
      duplicateKeys: [],
      totalAvailable: 3,
    });

    const stats = await getVariantKeyStats(variant.id);
    expect(stats).toEqual({ available: 3, reserved: 0, sold: 0 });
  });

  it("ignora chaves duplicadas no mesmo lote e chaves já existentes no banco", async () => {
    const variant = await createSampleVariant();
    await prisma.key.create({
      data: {
        variantId: variant.id,
        keyCode: "KEY-EXISTENTE",
        status: KeyStatus.AVAILABLE,
      },
    });

    const result = await allocateKeysBatch({
      variantId: variant.id,
      keys: ["KEY-EXISTENTE", "KEY-NOVA", "KEY-NOVA"],
    });

    expect(result).toEqual({
      insertedCount: 1,
      duplicateKeys: ["KEY-NOVA", "KEY-EXISTENTE"],
      totalAvailable: 2,
    });
    expect(await prisma.key.count({ where: { variantId: variant.id } })).toBe(2);
  });

  it("recusa variant inexistente com NotFoundError e não grava nada", async () => {
    await expect(
      allocateKeysBatch({
        variantId: crypto.randomUUID(),
        keys: ["KEY-001"],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(await prisma.key.count()).toBe(0);
  });

  it("recusa payload inválido com ValidationError", async () => {
    await expect(
      allocateKeysBatch({
        variantId: "invalido",
        keys: [],
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(await prisma.key.count()).toBe(0);
  });
});
