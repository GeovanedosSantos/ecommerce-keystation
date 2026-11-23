import { stripAccents } from "./strip-accents";

/** Slug para URLs: "Baldur's Gate 3" -> "baldurs-gate-3", "Ação" -> "acao". */
export function slugify(text: string): string {
  return stripAccents(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
