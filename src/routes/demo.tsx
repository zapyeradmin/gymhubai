import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarDemo } from "@/components/sidebar-demo";

export const Route = createFileRoute("/demo")({ component: DemoLayout });

function DemoLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarDemo />
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-900 px-4 py-2 text-sm text-center font-medium">
            ⚡ Você está vendo a demo de <strong>FitZone Performance</strong> com 287 alunos. <Link to="/entrar" className="underline font-bold ml-1">Criar minha conta grátis →</Link>
          </div>
          <header className="h-12 flex items-center justify-between border-b border-zinc-200 bg-white px-4">
            <SidebarTrigger />
            <Link to="/" className="text-xs text-zinc-500 hover:text-[#F97316]">← Voltar ao site</Link>
          </header>
          <main className="flex-1 p-6 bg-[#FAFAFA]"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}