import { describe, it, expect } from "vitest";
import { pageRange, totalPages, normalizeSearch, isActiveStatus, splitWhatsapp } from "./empresa-list";

describe("empresas list", () => {
  it("5 empresas por página", () => {
    expect(pageRange(1)).toEqual([0, 4]);
    expect(pageRange(3)).toEqual([10, 14]);
    expect(totalPages(6)).toBe(2);
    expect(totalPages(0)).toBe(1);
  });
  it("busca aceita CNPJ com pontuação", () => {
    expect(normalizeSearch("12.345.678/0001-90").digits).toBe("12345678000190");
  });
  it("trial conta como Ativa, blocked como Inativa", () => {
    expect(isActiveStatus("trial")).toBe(true);
    expect(isActiveStatus("blocked")).toBe(false);
  });
  it("separa DDI do WhatsApp", () => {
    expect(splitWhatsapp("+5511999998888")).toEqual({ ddi: "55", numero: "11999998888" });
  });
});
