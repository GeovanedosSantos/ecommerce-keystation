import { describe, expect, it } from "vitest";
import { paymentInputSchema } from "./schema";

const validCard = {
    method: "card",
    holderName: "Maria Silva",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/99",
    cvv: "123",
    cpf: "529.982.247-25",
};

const pathsOf = (input: unknown) => {
    const result = paymentInputSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

describe("paymentInputSchema", () => {
    it("aceita cartão válido e normaliza o CPF", () => {
        const result = paymentInputSchema.parse(validCard);
        expect(result.cpf).toBe("52998224725");
    });

    it.each(["pix", "boleto"])("aceita %s só com CPF", (method) => {
        expect(paymentInputSchema.safeParse({ method, cpf: "52998224725" }).success).toBe(true);
    });

    it("recusa método desconhecido", () => {
        expect(pathsOf({ method: "cheque", cpf: "52998224725" })).toEqual(["method"]);
    });

    it.each([
        ["expiry", { expiry: "01/20" }],
        ["expiry", { expiry: "1220" }],
        ["cvv", { cvv: "12" }],
        ["holderName", { holderName: "" }],
    ])("recusa cartão com %s inválido", (field, override) => {
        expect(pathsOf({ ...validCard, ...override })).toEqual([field]);
    });

    it("recusa CPF inválido", () => {
        expect(pathsOf({ method: "pix", cpf: "123" })).toEqual(["cpf"]);
    });
});
