import { describe, it, expect } from "vitest";
import { isStrongPassword, cobrancaMonths } from "./empresa";

describe("empresa", () => {
  it("requires 8+ chars with upper, lower, number and symbol", () => {
    expect(isStrongPassword("Abcdef1!")).toBe(true);
    expect(isStrongPassword("Abcde1!")).toBe(false);
    expect(isStrongPassword("abcdef1!")).toBe(false);
    expect(isStrongPassword("ABCDEF1!")).toBe(false);
    expect(isStrongPassword("Abcdefg!")).toBe(false);
    expect(isStrongPassword("Abcdefg1")).toBe(false);
  });
  it("maps billing types to months", () => {
    expect(cobrancaMonths("mensal")).toBe(1);
    expect(cobrancaMonths("trimestral")).toBe(3);
    expect(cobrancaMonths("semestral")).toBe(6);
    expect(cobrancaMonths("anual")).toBe(12);
  });
});
