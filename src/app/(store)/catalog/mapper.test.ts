import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogPage } from "@/core/modules/catalog/types";
import { toResultsLabel } from "./mapper";

const pageOf = (itemCount: number, total: number, page = 1, pageSize = 24): CatalogPage => ({
  items: Array.from({ length: itemCount }, () => ({}) as CatalogItem),
  total,
  page,
  pageSize,
  pageCount: Math.ceil(total / pageSize),
});

describe("toResultsLabel", () => {
  it.each([
    [pageOf(1, 1), "1 resultado"],
    [pageOf(8, 8), "8 resultados"],
    [pageOf(24, 30), "Mostrando 1–24 de 30 resultados"],
    [pageOf(6, 30, 2), "Mostrando 25–30 de 30 resultados"],
    [pageOf(24, 1500, 3), "Mostrando 49–72 de 1.500 resultados"],
  ])("%#: %s", (page, label) => {
    expect(toResultsLabel(page)).toBe(label);
  });
});
