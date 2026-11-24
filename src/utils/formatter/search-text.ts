import { stripAccents } from "./strip-accents";

/** O termo digitado e a coluna do banco passam por aqui: "pokemon" encontra "Pokémon". */
export function normalizeSearchText(text: string): string {
  return stripAccents(text).toLowerCase().replace(/\s+/g, " ").trim();
}
