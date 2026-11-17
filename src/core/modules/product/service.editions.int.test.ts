import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infra/prisma";
import { resetDatabase } from "@/test/db";
import { createProduct, getPublishedEditions } from "./service";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("getPublishedEditions", () => {
    /** Cria um produto; com `published`, ganha uma variant Steam publicada. */
    async function product(
        title: string,
        category: "GAME" | "DLC" | "SPECIAL_EDITION",
        { baseProductId, published = true }: { baseProductId?: string; published?: boolean } = {},
    ) {
        const steam =
            (await prisma.platform.findUnique({ where: { name: "Steam" } })) ??
            (await prisma.platform.create({ data: { name: "Steam" } }));

        return createProduct({
            category,
            title,
            description: "x",
            baseProductId,
            variants: [
                {
                    platformId: steam.id,
                    price: 99.9,
                    releaseDate: "2026-01-01",
                    status: published ? "PUBLISHED" : "DISABLED",
                },
            ],
        });
    }

    const titles = (editions: { title: string }[]) => editions.map(({ title }) => title);

    it("no jogo base, retorna as edições especiais publicadas em ordem de título", async () => {
        const base = await product("Cyberpunk 2077", "GAME");
        await product("Cyberpunk 2077 Ultimate", "SPECIAL_EDITION", { baseProductId: base.id });
        await product("Cyberpunk 2077 Deluxe", "SPECIAL_EDITION", { baseProductId: base.id });

        expect(titles(await getPublishedEditions(base))).toEqual([
            "Cyberpunk 2077 Deluxe",
            "Cyberpunk 2077 Ultimate",
        ]);
    });

    it("numa edição especial, retorna o jogo base primeiro e as outras edições, sem ela mesma", async () => {
        const base = await product("Cyberpunk 2077", "GAME");
        const ultimate = await product("Cyberpunk 2077 Ultimate", "SPECIAL_EDITION", {
            baseProductId: base.id,
        });
        await product("Cyberpunk 2077 Deluxe", "SPECIAL_EDITION", { baseProductId: base.id });

        expect(titles(await getPublishedEditions(ultimate))).toEqual([
            "Cyberpunk 2077",
            "Cyberpunk 2077 Deluxe",
        ]);
    });

    it("não trata DLC como edição do jogo", async () => {
        const base = await product("Cyberpunk 2077", "GAME");
        const dlc = await product("Phantom Liberty", "DLC", { baseProductId: base.id });

        expect(await getPublishedEditions(base)).toEqual([]);
        expect(await getPublishedEditions(dlc)).toEqual([]);
    });

    it("ignora edições sem variant publicada", async () => {
        const base = await product("Cyberpunk 2077", "GAME");
        await product("Cyberpunk 2077 Ultimate", "SPECIAL_EDITION", {
            baseProductId: base.id,
            published: false,
        });

        expect(await getPublishedEditions(base)).toEqual([]);
    });

    it("não mistura edições de outro jogo", async () => {
        const cyberpunk = await product("Cyberpunk 2077", "GAME");
        const witcher = await product("The Witcher 3", "GAME");
        await product("The Witcher 3 GOTY", "SPECIAL_EDITION", { baseProductId: witcher.id });

        expect(await getPublishedEditions(cyberpunk)).toEqual([]);
    });

    it("retorna só os campos usados no card, com as variants publicadas", async () => {
        const base = await product("Cyberpunk 2077", "GAME");
        const ultimate = await product("Cyberpunk 2077 Ultimate", "SPECIAL_EDITION", {
            baseProductId: base.id,
        });

        expect(await getPublishedEditions(base)).toEqual([
            {
                id: ultimate.id,
                slug: ultimate.slug,
                title: "Cyberpunk 2077 Ultimate",
                category: "SPECIAL_EDITION",
                coverPath: null,
                developer: null,
                variants: [
                    {
                        id: ultimate.variants[0].id,
                        platform: { id: ultimate.variants[0].platformId, name: "Steam" },
                    },
                ],
            },
        ]);
    });
});
