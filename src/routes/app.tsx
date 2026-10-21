import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarTenant } from "@/components/sidebar-tenant";
import { TrialBanner } from "@/components/trial-banner";
import { Button } from "@/components/ui/button";
import { canAccess, featureFromPath } from "@/lib/system-plans";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const { tenant, loading: tLoading } = useTenant();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/entrar", replace: true }); return; }
    if (tLoading) return;
    // Sem academia e não é super admin → onboarding
    if (!tenant?.academyId && !tenant?.isSuperAdmin) {
      // permite acesso à rota onboarding sem academia
      if (!window.location.pathname.endsWith("/onboarding")) {
        navigate({ to: "/app/onboarding", replace: true });
      }
    }
  }, [user, loading, tenant, tLoading, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const allowed = canAccess(tenant?.academy?.system_plan?.permissoes, featureFromPath(path), tenant?.isSuperAdmin);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarTenant />
        <div className="flex-1 flex flex-col">
          <TrialBanner />
          <header className="h-12 flex items-center border-b border-border bg-background">
            <SidebarTrigger className="ml-2" />
          </header>
          <main className="flex-1 p-6 bg-background">
            {allowed ? <Outlet /> : (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <Lock className="h-10 w-10 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Recurso não incluído no seu plano</h2>
                <p className="text-sm text-muted-foreground">Fale com o suporte para mudar de plano.</p>
                <Button asChild variant="outline"><Link to="/app/dashboard">Voltar ao Dashboard</Link></Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}