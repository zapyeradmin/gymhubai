import { describe, it, expect } from "vitest";
import { isValidCPF, isValidCNPJ, defaultConselho } from "./documento";

describe("documento", () => {
  it("accepts valid CPF", () => expect(isValidCPF("529.982.247-25")).toBe(true));
  it("rejects invalid CPF", () => expect(isValidCPF("529.982.247-24")).toBe(false));
  it("accepts valid CNPJ", () => expect(isValidCNPJ("11.222.333/0001-81")).toBe(true));
  it("rejects invalid CNPJ", () => expect(isValidCNPJ("11.222.333/0001-80")).toBe(false));
  it("pilates uses CREFITO", () => expect(defaultConselho("estudio_pilates")).toBe("CREFITO"));
  it("others use CREF", () => expect(defaultConselho("box_crossfit")).toBe("CREF"));
});
