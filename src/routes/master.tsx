import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarMaster } from "@/components/sidebar-master";

export const Route = createFileRoute("/master")({ component: MasterLayout });

function MasterLayout() {
  const { user, loading } = useAuth();
  const { tenant, loading: tLoading } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || tLoading) return;
    if (!user) navigate({ to: "/entrar", replace: true });
    else if (!tenant?.isSuperAdmin) navigate({ to: "/entrar", replace: true });
  }, [user, loading, tenant, tLoading, navigate]);

  if (loading || tLoading || !user || !tenant?.isSuperAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verificando acesso…</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarMaster />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-red-50 dark:bg-red-950/30">
            <SidebarTrigger className="ml-2" />
            <span className="ml-3 text-xs font-medium text-red-700 dark:text-red-300">MASTER · Super admin</span>
            <Link to="/app/dashboard" className="ml-auto mr-4 flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300 hover:underline">
              <ArrowLeft className="h-3 w-3" />Voltar para Empresa
            </Link>
          </header>
          <main className="flex-1 p-6 bg-background"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}