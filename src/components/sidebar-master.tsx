import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Building2, BarChart3, PlusSquare, LogOut, Shield, Settings, ArrowLeft, Tag } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

const items = [
  { title: "Painel", url: "/master/painel", icon: BarChart3 },
  { title: "Academias", url: "/master/listaAcademias", icon: Building2 },
  { title: "Nova academia", url: "/master/novaAcademia", icon: PlusSquare },
  { title: "Planos", url: "/master/planos", icon: Tag },
  { title: "Configuracoes do sistema", url: "/master/configuracoes", icon: Settings },
];

export function SidebarMaster() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-700">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Master</span>
            <span className="text-xs text-sidebar-foreground/60">Super admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" /><span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/60 truncate group-data-[collapsible=icon]:hidden">{user?.email}</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/app/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /><span>Voltar para Empresa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={async () => { await signOut(); navigate({ to: "/entrar", replace: true }); }}>
              <LogOut className="h-4 w-4" /><span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}