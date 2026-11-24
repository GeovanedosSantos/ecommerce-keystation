import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createProduct, updateProduct } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const game = {
    category: "GAME",
    title: "Pokémon Edição Ouro",
    description: "RPG",
    developer: "Game Freak",
};

const searchFieldsOf = (slug: string) =>
    prisma.product.findUniqueOrThrow({
        where: { slug },
        select: { searchText: true, developerSlug: true },
    });

describe("createProduct", () => {
    it("grava a busca e o slug da desenvolvedora", async () => {
        const { slug } = await createProduct(game);

        expect(await searchFieldsOf(slug)).toEqual({
            searchText: "pokemon edicao ouro game freak",
            developerSlug: "game-freak",
        });
    });
});

describe("updateProduct", () => {
    it("recalcula ao mudar só o título, mantendo a desenvolvedora", async () => {
        const { slug } = await createProduct(game);

        await updateProduct(slug, { title: "Pokémon Edição Prata" });

        expect(await searchFieldsOf(slug)).toEqual({
            searchText: "pokemon edicao prata game freak",
            developerSlug: "game-freak",
        });
    });

    it("recalcula ao mudar só a desenvolvedora, mantendo o título", async () => {
        const { slug } = await createProduct(game);

        await updateProduct(slug, { developer: "Nintendo" });

        expect(await searchFieldsOf(slug)).toEqual({
            searchText: "pokemon edicao ouro nintendo",
            developerSlug: "nintendo",
        });
    });

    it("remove a desenvolvedora da busca quando ela vira null", async () => {
        const { slug } = await createProduct(game);

        await updateProduct(slug, { developer: null });

        expect(await searchFieldsOf(slug)).toEqual({
            searchText: "pokemon edicao ouro",
            developerSlug: null,
        });
    });

    it("não mexe na busca quando o título e a desenvolvedora não mudam", async () => {
        const { slug } = await createProduct(game);
        await prisma.product.update({ where: { slug }, data: { searchText: "valor-marcado" } });

        await updateProduct(slug, { description: "Outra descrição" });

        expect((await searchFieldsOf(slug)).searchText).toBe("valor-marcado");
    });
});
