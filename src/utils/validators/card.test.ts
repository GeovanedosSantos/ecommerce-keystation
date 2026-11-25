import { describe, expect, it } from "vitest";
import { isCardExpired, isValidCardNumber } from "./card";

describe("isValidCardNumber", () => {
    it.each(["4242 4242 4242 4242", "4111111111111111", "5555-5555-5555-4444"])(
        "aceita %s",
        (number) => {
            expect(isValidCardNumber(number)).toBe(true);
        },
    );

    it.each([
        ["Luhn inválido", "4242 4242 4242 4241"],
        ["curto demais", "424242"],
    ])("recusa %s", (_nome, number) => {
        expect(isValidCardNumber(number)).toBe(false);
    });
});

describe("isCardExpired", () => {
    const now = new Date(2026, 5, 15);

    it.each([
        [6, 26, false],
        [5, 26, true],
        [12, 25, true],
        [1, 30, false],
    ])("mês %i/ano %i vencido=%s", (month, year, expected) => {
        expect(isCardExpired(month, year, now)).toBe(expected);
    });
});
