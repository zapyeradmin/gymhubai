export const PLAN_FEATURES = [
  { key: "dashboard", label: "Dashboard", locked: true },
  { key: "alunos", label: "Alunos" },
  { key: "planos", label: "Planos" },
  { key: "agenda", label: "Agenda" },
  { key: "checkins", label: "Check-ins" },
  { key: "financeiro", label: "Financeiro" },
  { key: "relatorios", label: "Relatórios" },
  { key: "leads", label: "Leads" },
  { key: "aigrowth", label: "AI Growth" },
  { key: "equipe", label: "Equipe" },
  { key: "configuracoes", label: "Configurações", locked: true },
] as const;

export const ALWAYS_ALLOWED = ["dashboard", "configuracoes", "onboarding", "trocar-senha"];

export type PlanDuration = "recorrencia" | "trimestral" | "semestral" | "anual";

export const DURATIONS: { value: PlanDuration; label: string; months: number }[] = [
  { value: "recorrencia", label: "Recorrência (mensal)", months: 1 },
  { value: "trimestral", label: "Trimestral (3 meses)", months: 3 },
  { value: "semestral", label: "Semestral (6 meses)", months: 6 },
  { value: "anual", label: "Anual (12 meses)", months: 12 },
];

export const durationMonths = (d: PlanDuration) => DURATIONS.find((x) => x.value === d)?.months ?? 1;

/** Returns the feature key for an /app/* path, e.g. "/app/alunos" -> "alunos". */
export const featureFromPath = (path: string) => path.replace(/^\/app\/?/, "").split("/")[0] || "dashboard";

/** null permissions = no plan linked = everything allowed (legacy). */
export function canAccess(permissoes: string[] | null | undefined, feature: string, isSuperAdmin = false) {
  if (isSuperAdmin || !permissoes) return true;
  if (ALWAYS_ALLOWED.includes(feature)) return true;
  return permissoes.includes(feature);
}

export const isOverLimit = (activeCount: number, max: number | null | undefined) =>
  max != null && activeCount >= max;

export const isOverStudentLimit = isOverLimit;
