import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Building2, BarChart3, PlusSquare, LogOut, Shield, Settings, ArrowLeft, Tag } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import logoFull from "@/assets/logo-gym-hub.png.asset.json";
import logoIcon from "@/assets/logo-gym-hub-2.png.asset.json";

const items = [
  { title: "Painel", url: "/master/painel", icon: BarChart3 },
  { title: "Empresas", url: "/master/listaempresa", icon: Building2 },
  { title: "Nova Empresa", url: "/master/novaempresa", icon: PlusSquare },
  { title: "Planos", url: "/master/planos", icon: Tag },
  { title: "Configuracoes do sistema", url: "/master/configuracoes", icon: Settings },
];

export function SidebarMaster() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative bg-[#151310]">
        <div className="flex h-[92px] items-center justify-center px-3 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
          <img src={logoFull.url} alt="Gym Hub" className="w-[78%] h-auto object-contain group-data-[collapsible=icon]:hidden" />
          <img src={logoIcon.url} alt="Gym Hub" className="hidden h-8 w-8 rounded-md group-data-[collapsible=icon]:block" />
        </div>
        <span className="absolute inset-x-3 bottom-1.5 truncate text-center text-[10px] text-white/45 group-data-[collapsible=icon]:hidden">Master · Super admin</span>
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