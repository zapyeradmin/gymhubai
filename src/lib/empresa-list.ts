import { onlyDigits } from "@/lib/documento";
import { DDIS } from "@/lib/empresa";

export const EMPRESAS_PAGE_SIZE = 5;

export function pageRange(page: number, size = EMPRESAS_PAGE_SIZE): [number, number] {
  const p = Math.max(1, Math.floor(page || 1));
  return [(p - 1) * size, p * size - 1];
}

export const totalPages = (count: number, size = EMPRESAS_PAGE_SIZE) => Math.max(1, Math.ceil(count / size));

/** Search text stripped of chars that break PostgREST `or` filters, plus digits for CNPJ/CPF. */
export function normalizeSearch(q: string) {
  const text = (q ?? "").replace(/[,()%*\\]/g, " ").trim().slice(0, 100);
  return { text, digits: onlyDigits(q ?? "") };
}

export const isActiveStatus = (s: string | null | undefined) => s === "active" || s === "trial";

/** Split "+5511999998888" into DDI + local number. */
export function splitWhatsapp(full: string | null | undefined) {
  const d = onlyDigits(full ?? "");
  if (!d) return { ddi: "55", numero: "" };
  const codes = DDIS.map((x) => x.code).sort((a, b) => b.length - a.length);
  const ddi = codes.find((c) => d.startsWith(c)) ?? "55";
  return { ddi, numero: d.slice(ddi.length) };
}
