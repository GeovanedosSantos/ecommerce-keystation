import { z } from "zod";

export type ParsedKeyBatch = {
  uniqueKeys: string[];
  internalDuplicates: string[];
};

/**
 * Quebra um texto colado (uma chave por linha ou separadas por vírgula),
 * removendo espaços extras, linhas vazias e separando duplicatas do lote.
 */
export function parseKeyBatch(rawKeys: string): ParsedKeyBatch {
  const seen = new Set<string>();
  const uniqueKeys: string[] = [];
  const internalDuplicates: string[] = [];

  for (const part of rawKeys.split(/[\r\n,]+/)) {
    const code = part.trim();
    if (!code) continue;

    if (seen.has(code)) {
      internalDuplicates.push(code);
    } else {
      seen.add(code);
      uniqueKeys.push(code);
    }
  }

  return { uniqueKeys, internalDuplicates };
}

export const allocateKeysBatchSchema = z.strictObject({
  variantId: z.uuid("Variant inválida"),
  keys: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Chave não pode ser vazia")
        .max(100, "Cada chave deve ter no máximo 100 caracteres"),
    )
    .min(1, "Informe ao menos uma chave válida"),
});

export type AllocateKeysBatchInput = z.infer<typeof allocateKeysBatchSchema>;
