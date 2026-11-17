import { describe, expect, it } from "vitest";
import { createProductSchema, variantSchema } from "./schema";

type Unit = "GB" | "MB";

const requirements = (ram: [number, Unit], disk: [number, Unit]) => ({
    os: "Windows 10 64 bits",
    processor: "Intel Core i5",
    ram: { value: ram[0], unit: ram[1] },
    gpu: "GTX 1060 6 GB",
    disk_space: { value: disk[0], unit: disk[1] },
});

const gameWith = (systemRequirements: unknown) => ({
    category: "GAME",
    title: "Hollow Knight",
    description: "Metroidvania",
    systemRequirements,
});

/** Caminhos (ex: "systemRequirements.recommended.ram") dos erros de um safeParse. */
const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
    result.error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("systemRequirements", () => {
    it("recusa RAM recomendada menor que a mínima", () => {
        const result = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([8, "GB"], [50, "GB"]),
                recommended: requirements([4, "GB"], [50, "GB"]),
            }),
        );

        expect(result.success).toBe(false);
        expect(issuePaths(result)).toEqual(["systemRequirements.recommended.ram"]);
    });

    it("recusa disco recomendado menor que o mínimo", () => {
        const result = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([8, "GB"], [50, "GB"]),
                recommended: requirements([8, "GB"], [40, "GB"]),
            }),
        );

        expect(result.success).toBe(false);
        expect(issuePaths(result)).toEqual(["systemRequirements.recommended.disk_space"]);
    });

    it("aponta os dois erros quando RAM e disco recomendados são menores", () => {
        const result = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([8, "GB"], [50, "GB"]),
                recommended: requirements([4, "GB"], [40, "GB"]),
            }),
        );

        expect(issuePaths(result)).toEqual([
            "systemRequirements.recommended.ram",
            "systemRequirements.recommended.disk_space",
        ]);
    });

    it("compara em MB quando as unidades são diferentes", () => {
        // 2 GB = 2048 MB > 1536 MB
        const smaller = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([2, "GB"], [1, "GB"]),
                recommended: requirements([1536, "MB"], [1, "GB"]),
            }),
        );
        // 1 GB = 1024 MB
        const equal = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([1024, "MB"], [1, "GB"]),
                recommended: requirements([1, "GB"], [1024, "MB"]),
            }),
        );

        expect(issuePaths(smaller)).toEqual(["systemRequirements.recommended.ram"]);
        expect(equal.success).toBe(true);
    });

    it.each(["os", "gpu"])("recusa requisitos sem %s", (field) => {
        const block = Object.fromEntries(
            Object.entries(requirements([8, "GB"], [50, "GB"])).filter(([key]) => key !== field),
        );

        const result = createProductSchema.safeParse(
            gameWith({ minimum: block, recommended: requirements([8, "GB"], [50, "GB"]) }),
        );

        expect(result.success).toBe(false);
        expect(issuePaths(result)).toEqual([`systemRequirements.minimum.${field}`]);
    });

    it("aceita recomendado maior ou igual ao mínimo", () => {
        const result = createProductSchema.safeParse(
            gameWith({
                minimum: requirements([8, "GB"], [50, "GB"]),
                recommended: requirements([16, "GB"], [50, "GB"]),
            }),
        );

        expect(result.success).toBe(true);
    });
});

describe("imagens do produto", () => {
    const gameWithImages = (coverPath: string, galleryPath = coverPath) => ({
        category: "GAME",
        title: "Hollow Knight",
        description: "Metroidvania",
        coverPath,
        gallery: [{ path: galleryPath, position: 0 }],
    });

    it.each([
        "/covers/hollow-knight.jpg",
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/capsule_616x353.jpg",
        "https://images.igdb.com/igdb/image/upload/t_1080p/sc1abc.jpg",
    ])("aceita %s", (path) => {
        expect(createProductSchema.safeParse(gameWithImages(path)).success).toBe(true);
    });

    it.each([
        ["host fora da lista", "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg"],
        ["caminho fora do liberado no host", "https://shared.akamai.steamstatic.com/outra-pasta/capa.jpg"],
        ["http sem TLS", "http://images.igdb.com/igdb/image/upload/t_1080p/sc1abc.jpg"],
    ])("recusa %s na capa e na galeria", (_label, path) => {
        const result = createProductSchema.safeParse(gameWithImages(path));

        expect(result.success).toBe(false);
        expect(issuePaths(result)).toEqual(["coverPath", "gallery.0.path"]);
    });
});

describe("preço da variant", () => {
    const variant = (price: number) => ({
        platformId: crypto.randomUUID(),
        price,
        releaseDate: "2026-01-01",
    });

    it.each([0, -1, -0.01])("recusa preço %s", (price) => {
        const result = variantSchema.safeParse(variant(price));

        expect(result.success).toBe(false);
        expect(issuePaths(result)).toEqual(["price"]);
    });

    it("recusa preço com mais de 2 casas decimais", () => {
        expect(issuePaths(variantSchema.safeParse(variant(10.999)))).toEqual(["price"]);
    });

    it.each([0.01, 59.9, 199.99])("aceita preço %s", (price) => {
        expect(variantSchema.safeParse(variant(price)).success).toBe(true);
    });
});
