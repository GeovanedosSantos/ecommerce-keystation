import { describe, expect, it } from "vitest";
import { formatCardExpiry, formatCardNumber, formatCpf } from "./payment-fields";

describe("formatCpf", () => {
    it.each([
        ["5299", "529.9"],
        ["5299822", "529.982.2"],
        ["52998224725", "529.982.247-25"],
        ["529abc982247259999", "529.982.247-25"],
    ])("%j vira %j", (input, expected) => {
        expect(formatCpf(input)).toBe(expected);
    });
});

describe("formatCardNumber", () => {
    it.each([
        ["42424", "4242 4"],
        ["4242424242424242", "4242 4242 4242 4242"],
        ["4242 4242 abcd 4242", "4242 4242 4242"],
    ])("%j vira %j", (input, expected) => {
        expect(formatCardNumber(input)).toBe(expected);
    });
});

describe("formatCardExpiry", () => {
    it.each([
        ["12", "12"],
        ["123", "12/3"],
        ["12/3099", "12/30"],
    ])("%j vira %j", (input, expected) => {
        expect(formatCardExpiry(input)).toBe(expected);
    });
});
