import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Tag, ScanLine, Wallet, BarChart3, Sparkles, Dumbbell, Calendar, UserCog, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/demo/dashboard", icon: LayoutDashboard },
  { title: "Alunos", url: "/demo/alunos", icon: Users },
  { title: "Check-ins", url: "/demo/checkins", icon: ScanLine },
  { title: "Planos", url: "/demo/planos", icon: Tag },
  { title: "Agenda", url: "/demo/agenda", icon: Calendar },
  { title: "Financeiro", url: "/demo/financeiro", icon: Wallet },
  { title: "Relatórios", url: "/demo/relatorios", icon: BarChart3 },
  { title: "AI Growth", url: "/demo/aigrowth", icon: Sparkles },
  { title: "Equipe", url: "/demo/equipe", icon: UserCog },
  { title: "Configurações", url: "/demo/configuracoes", icon: Settings },
];

export function SidebarDemo() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon" className="bg-[#18181B] text-white border-r-0 [&_*]:border-zinc-800">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#F97316] to-[#FACC15]">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white">GymBoss AI</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">FitZone Performance</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#18181B]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} className={`text-white/70 hover:bg-white/5 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#F97316]/20 data-[active=true]:to-transparent data-[active=true]:text-[#F97316] data-[active=true]:border-l-2 data-[active=true]:border-[#F97316]`}>
                    <Link to={item.url} className="flex items-center gap-2 font-medium">
                      <item.icon className="h-4 w-4" /><span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-3 group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-gradient-to-br from-[#F97316] to-[#FACC15] p-4 text-white">
            <div className="text-xs font-bold uppercase tracking-wider mb-1">⚡ Modo Demo</div>
            <p className="text-xs text-white/90 mb-3">Dados de demonstração. Crie sua conta grátis.</p>
            <Link to="/entrar" className="block w-full bg-white text-[#18181B] text-xs font-bold text-center py-2 rounded-md hover:bg-white/90">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}