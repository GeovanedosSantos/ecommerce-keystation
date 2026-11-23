import { describe, expect, it } from "vitest";
import { productSearchFields } from "./search-fields";

describe("productSearchFields", () => {
    it("junta título e desenvolvedora sem acentos nem maiúsculas", () => {
        expect(productSearchFields("Pokémon Edição Ouro", "Game Freak")).toEqual({
            searchText: "pokemon edicao ouro game freak",
            developerSlug: "game-freak",
        });
    });

    it.each([null, undefined, ""])("sem desenvolvedora (%j), o slug é null", (developer) => {
        expect(productSearchFields("Hollow Knight", developer)).toEqual({
            searchText: "hollow knight",
            developerSlug: null,
        });
    });

    it("desenvolvedora sem letras nem números vira slug null", () => {
        expect(productSearchFields("Hollow Knight", "???").developerSlug).toBeNull();
    });
});
