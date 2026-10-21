import { describe, it, expect } from "vitest";
import { durationMonths, canAccess, isOverStudentLimit, featureFromPath } from "./system-plans";

describe("system plans", () => {
  it("maps durations to 1/3/6/12 months", () => {
    expect(durationMonths("recorrencia")).toBe(1);
    expect(durationMonths("trimestral")).toBe(3);
    expect(durationMonths("semestral")).toBe(6);
    expect(durationMonths("anual")).toBe(12);
  });
  it("blocks a new active student when limit reached", () => {
    expect(isOverStudentLimit(50, 50)).toBe(true);
    expect(isOverStudentLimit(49, 50)).toBe(false);
  });
  it("blocks pages not in plan but allows dashboard and super admin", () => {
    expect(canAccess(["alunos"], featureFromPath("/app/financeiro"))).toBe(false);
    expect(canAccess(["alunos"], featureFromPath("/app/dashboard"))).toBe(true);
    expect(canAccess(["alunos"], "financeiro", true)).toBe(true);
  });
});
