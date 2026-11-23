import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./search-text";

describe("normalizeSearchText", () => {
  it.each([
    ["Pokémon", "pokemon"],
    ["POKÉMON", "pokemon"],
    ["Ação", "acao"],
    ["Baldur's Gate 3", "baldur's gate 3"],
    ["  Elden \t  Ring \n", "elden ring"],
  ])("transforma %j em %j", (text, normalized) => {
    expect(normalizeSearchText(text)).toBe(normalized);
  });

  it("mantém pontuação e símbolos, que a busca trata como texto", () => {
    expect(normalizeSearchText("100% Orange_Juice")).toBe("100% orange_juice");
  });
});
