import { describe, expect, it } from "vitest";
import { createProductSchema, variantSchema } from "./schema";

type Unit = "GB" | "MB";

const requirements = (ram: [number, Unit], disk: [number, Unit]) => ({
    processor: "Intel Core i5",
    ram: { value: ram[0], unit: ram[1] },
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
