export const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");

export function isValidCPF(input: string): boolean {
  const c = onlyDigits(input);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  for (const t of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += Number(c[i]) * (t + 1 - i);
    const d = ((sum * 10) % 11) % 10;
    if (d !== Number(c[t])) return false;
  }
  return true;
}

export function isValidCNPJ(input: string): boolean {
  const c = onlyDigits(input);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = w.reduce((a, wi, i) => a + Number(c[i]) * wi, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c[12]) && calc(13) === Number(c[13]);
}

export function maskCPF(v: string) {
  return onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function maskCNPJ(v: string) {
  return onlyDigits(v).slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export const BUSINESS_TYPES = [
  { value: "academia", label: "Academia" },
  { value: "estudio_personal", label: "Estúdio de Treino Personalizado" },
  { value: "estudio_funcional", label: "Estúdio de Treinamento Funcional" },
  { value: "estudio_pilates", label: "Estúdio de Pilates" },
  { value: "artes_marciais", label: "Academia de Artes Marciais" },
  { value: "box_crossfit", label: "Box de CrossFit" },
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export const defaultConselho = (t: string) => (t === "estudio_pilates" ? "CREFITO" : "CREF");
