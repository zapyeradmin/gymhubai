import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type AppRole = "super_admin" | "admin" | "professor" | "recepcao" | "personal" | "demo";

export type TenantInfo = {
  role: AppRole | null;
  academyId: string | null;
  academy: {
    id: string;
    name: string;
    cor_primaria: string | null;
    status: string;
    trial_ate: string | null;
    plano: string;
    valor_mensal: number | null;
    system_plan: { nome: string; permissoes: string[]; max_alunos_ativos: number; max_equipe_ativos: number } | null;
  } | null;
  isSuperAdmin: boolean;
};

export function useTenant() {
  const { user, loading } = useAuth();

  // First-login super_admin claim: if app_config has no super admins, the
  // first authenticated user automatically becomes the owner/super_admin.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try { await supabase.rpc("claim_super_admin_if_empty"); } catch { /* noop */ }
    })();
  }, [user?.id]);

  const q = useQuery({
    queryKey: ["tenant-info", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantInfo> => {
      // Try to claim super_admin role on first login (idempotent server-side).
      await supabase.rpc("claim_super_admin_if_empty");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, academy_id")
        .eq("user_id", user!.id);

      const isSuper = (roles ?? []).some((r) => r.role === "super_admin");
      const tenantRole = (roles ?? []).find((r) => r.academy_id) ?? null;

      let academy = null;
      if (tenantRole?.academy_id) {
        const { data } = await supabase
          .from("academy")
          .select("id, name, cor_primaria, status, trial_ate, plano, valor_mensal, system_plan(nome, permissoes, max_alunos_ativos, max_equipe_ativos)")
          .eq("id", tenantRole.academy_id)
          .maybeSingle();
        academy = data as TenantInfo["academy"];
      }

      return {
        role: (tenantRole?.role as AppRole) ?? (isSuper ? "super_admin" : null),
        academyId: tenantRole?.academy_id ?? null,
        academy,
        isSuperAdmin: isSuper,
      };
    },
  });

  return {
    tenant: q.data,
    loading: loading || q.isLoading,
    refetch: q.refetch,
  };
}