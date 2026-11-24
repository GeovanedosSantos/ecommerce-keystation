export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Até 7 páginas cabem inteiras; acima disso são sempre 7 posições. */
const MAX_ITEMS = 7;

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * Números da paginação, sempre com a primeira e a última página:
 * 1 2 3 4 5 … 20 · 1 … 9 10 11 … 20 · 1 … 16 17 18 19 20
 */
export function paginationItems(current: number, pageCount: number): PageItem[] {
  if (pageCount <= MAX_ITEMS) return range(1, pageCount);

  if (current <= 4) return [...range(1, 5), "ellipsis-end", pageCount];
  if (current >= pageCount - 3) return [1, "ellipsis-start", ...range(pageCount - 4, pageCount)];

  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", pageCount];
}
