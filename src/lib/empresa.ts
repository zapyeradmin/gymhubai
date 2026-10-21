export const COBRANCAS = [
  { value: "mensal", label: "Mensal", months: 1 },
  { value: "trimestral", label: "Trimestral", months: 3 },
  { value: "semestral", label: "Semestral", months: 6 },
  { value: "anual", label: "Anual", months: 12 },
] as const;
export type Cobranca = (typeof COBRANCAS)[number]["value"];
export const cobrancaMonths = (c: string) => COBRANCAS.find((x) => x.value === c)?.months ?? 1;
export const cobrancaLabel = (c: string) => COBRANCAS.find((x) => x.value === c)?.label ?? "Mensal";

export const PASSWORD_RULES = [
  { key: "len", label: "Mínimo 8 caracteres", test: (s: string) => s.length >= 8 },
  { key: "upper", label: "Letra maiúscula", test: (s: string) => /[A-Z]/.test(s) },
  { key: "lower", label: "Letra minúscula", test: (s: string) => /[a-z]/.test(s) },
  { key: "num", label: "Número", test: (s: string) => /\d/.test(s) },
  { key: "sym", label: "Símbolo", test: (s: string) => /[^A-Za-z0-9]/.test(s) },
];
export const isStrongPassword = (s: string) => PASSWORD_RULES.every((r) => r.test(s));

export const DDIS = [
  { code: "55", label: "🇧🇷 +55" }, { code: "1", label: "🇺🇸 +1" }, { code: "351", label: "🇵🇹 +351" },
  { code: "54", label: "🇦🇷 +54" }, { code: "598", label: "🇺🇾 +598" }, { code: "595", label: "🇵🇾 +595" },
  { code: "56", label: "🇨🇱 +56" }, { code: "57", label: "🇨🇴 +57" }, { code: "51", label: "🇵🇪 +51" },
  { code: "591", label: "🇧🇴 +591" }, { code: "52", label: "🇲🇽 +52" }, { code: "34", label: "🇪🇸 +34" },
  { code: "44", label: "🇬🇧 +44" }, { code: "39", label: "🇮🇹 +39" }, { code: "49", label: "🇩🇪 +49" },
  { code: "33", label: "🇫🇷 +33" }, { code: "81", label: "🇯🇵 +81" },
];
