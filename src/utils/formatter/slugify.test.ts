import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it.each([
    ["Ação", "acao"],
    ["Mundo Aberto", "mundo-aberto"],
    ["Baldur's Gate 3", "baldurs-gate-3"],
    ["Marvel’s Spider-Man", "marvels-spider-man"],
    ["Pokémon: Edição Especial", "pokemon-edicao-especial"],
    ["  --Elden   Ring--  ", "elden-ring"],
    ["FromSoftware", "fromsoftware"],
  ])("transforma %j em %j", (text, slug) => {
    expect(slugify(text)).toBe(slug);
  });

  it("devolve vazio quando não sobra nenhuma letra ou número", () => {
    expect(slugify("!!! ???")).toBe("");
  });
});
