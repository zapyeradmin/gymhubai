import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Tag, CalendarDays, ScanLine, Wallet, BarChart3, Sparkles, UserCog, Settings, LogOut, Dumbbell, Inbox, Shield } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { canAccess, featureFromPath } from "@/lib/system-plans";
import logoFull from "@/assets/logo-gym-hub.png.asset.json";
import logoIcon from "@/assets/logo-gym-hub-2.png.asset.json";

const groups = [
  { label: "Principal", items: [
    { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
    { title: "Alunos",    url: "/app/alunos",    icon: Users },
    { title: "Planos",    url: "/app/planos",    icon: Tag },
    { title: "Agenda",    url: "/app/agenda",    icon: CalendarDays },
    { title: "Check-ins", url: "/app/checkins",  icon: ScanLine },
  ]},
  { label: "Operacional", items: [
    { title: "Financeiro", url: "/app/financeiro", icon: Wallet },
    { title: "Relatórios", url: "/app/relatorios", icon: BarChart3 },
    { title: "Leads",      url: "/app/leads",      icon: Inbox },
    { title: "AI Growth",  url: "/app/aigrowth",   icon: Sparkles, accent: true },
  ]},
  { label: "Gestão", items: [
    { title: "Equipe",        url: "/app/equipe",        icon: UserCog },
    { title: "Configurações", url: "/app/configuracoes", icon: Settings },
  ]},
];

export function SidebarTenant() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="[&_[data-sidebar=sidebar]]:bg-[#151310] [&_[data-sidebar=sidebar]]:text-white">
      <SidebarHeader className="bg-[#151310] border-b border-white/5">
        <div className="flex flex-col gap-1 px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
          <img src={logoFull.url} alt="Gym Hub" className="h-8 w-auto object-contain object-left group-data-[collapsible=icon]:hidden" />
          <img src={logoIcon.url} alt="Gym Hub" className="hidden h-8 w-8 rounded-md group-data-[collapsible=icon]:block" />
          <span className="truncate text-xs text-white/50 group-data-[collapsible=icon]:hidden">{tenant?.academy?.name ?? "—"}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#151310]">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-wider px-3">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.filter((item) => canAccess(tenant?.academy?.system_plan?.permissoes, featureFromPath(item.url), tenant?.isSuperAdmin)).map((item) => {
                  const active = path === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`text-white/70 hover:text-white hover:bg-white/5 data-[active=true]:bg-[#D97634]/15 data-[active=true]:text-[#E8935D] data-[active=true]:border-l-2 data-[active=true]:border-[#D97634] rounded-md`}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className={`h-4 w-4 ${item.accent ? "text-[#D97634]" : ""}`} />
                          <span>{item.title}</span>
                          {item.accent && <span className="ml-auto text-[9px] font-bold bg-[#D97634] text-white px-1.5 py-0.5 rounded">IA</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-[#151310] border-t border-white/5">
        <div className="px-2 py-1 text-xs text-white/50 truncate group-data-[collapsible=icon]:hidden">{user?.email}</div>
        <SidebarMenu>
          {tenant?.isSuperAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-white/70 hover:text-white hover:bg-white/5">
                <Link to="/master/painel" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#D97634]" /><span>Painel Super Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-white/70 hover:text-white hover:bg-white/5" onClick={async () => { await signOut(); navigate({ to: "/entrar", replace: true }); }}>
              <LogOut className="h-4 w-4" /><span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
