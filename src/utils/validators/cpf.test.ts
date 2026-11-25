import { describe, expect, it } from "vitest";
import { isValidCpf } from "./cpf";

describe("isValidCpf", () => {
    it.each(["52998224725", "529.982.247-25", "11144477735"])("aceita %s", (cpf) => {
        expect(isValidCpf(cpf)).toBe(true);
    });

    it.each([
        ["dígito verificador errado", "52998224726"],
        ["dígitos repetidos", "11111111111"],
        ["tamanho curto", "1234567"],
    ])("recusa %s", (_nome, cpf) => {
        expect(isValidCpf(cpf)).toBe(false);
    });
});
