import { describe, expect, it } from "vitest";
import { allocateKeysBatchSchema, parseKeyBatch } from "./schema";

const validVariantId = "01960000-0000-7000-8000-000000000001";

describe("parseKeyBatch", () => {
  it("separa chaves por quebra de linha e vírgula, removendo espaços e linhas vazias", () => {
    const raw = `
      AAAAA-BBBBB-CCCCC
      ,  DDDDD-EEEEE-FFFFF  
      
      GGGGG-HHHHH-IIIII,JJJJJ-KKKKK-LLLLL
    `;

    const result = parseKeyBatch(raw);

    expect(result.uniqueKeys).toEqual([
      "AAAAA-BBBBB-CCCCC",
      "DDDDD-EEEEE-FFFFF",
      "GGGGG-HHHHH-IIIII",
      "JJJJJ-KKKKK-LLLLL",
    ]);
    expect(result.internalDuplicates).toEqual([]);
  });

  it("identifica duplicatas dentro do mesmo lote preservando a primeira ocorrência", () => {
    const raw = "KEY-1\nKEY-2\nKEY-1\nKEY-3,KEY-2";

    const result = parseKeyBatch(raw);

    expect(result.uniqueKeys).toEqual(["KEY-1", "KEY-2", "KEY-3"]);
    expect(result.internalDuplicates).toEqual(["KEY-1", "KEY-2"]);
  });
});

describe("allocateKeysBatchSchema", () => {
  it("aceita payload válido e remove espaços das chaves", () => {
    const parsed = allocateKeysBatchSchema.parse({
      variantId: validVariantId,
      keys: ["  STEAM-1111  ", "STEAM-2222"],
    });

    expect(parsed.keys).toEqual(["STEAM-1111", "STEAM-2222"]);
  });

  it("recusa variantId que não é UUID", () => {
    const result = allocateKeysBatchSchema.safeParse({
      variantId: "123",
      keys: ["KEY-1"],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["variantId"]);
    }
  });

  it("recusa lista de chaves vazia", () => {
    const result = allocateKeysBatchSchema.safeParse({
      variantId: validVariantId,
      keys: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["keys"]);
    }
  });

  it("recusa chave com mais de 100 caracteres", () => {
    const result = allocateKeysBatchSchema.safeParse({
      variantId: validVariantId,
      keys: ["A".repeat(101)],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["keys", 0]);
    }
  });
});
