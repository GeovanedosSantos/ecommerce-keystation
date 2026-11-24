import { describe, expect, it } from "vitest";
import { paginationItems } from "./pagination";

describe("paginationItems", () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
  ])("página %i de %i mostra todas", (current, pageCount, expected) => {
    expect(paginationItems(current, pageCount)).toEqual(expected);
  });

  it.each([
    [1, 20, [1, 2, 3, 4, 5, "ellipsis-end", 20]],
    [4, 20, [1, 2, 3, 4, 5, "ellipsis-end", 20]],
    [5, 20, [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 20]],
    [10, 20, [1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20]],
    [16, 20, [1, "ellipsis-start", 15, 16, 17, "ellipsis-end", 20]],
    [17, 20, [1, "ellipsis-start", 16, 17, 18, 19, 20]],
    [20, 20, [1, "ellipsis-start", 16, 17, 18, 19, 20]],
  ])("página %i de %i usa reticências", (current, pageCount, expected) => {
    expect(paginationItems(current, pageCount)).toEqual(expected);
  });
});
