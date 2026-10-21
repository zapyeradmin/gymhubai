import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Users, Crown } from "lucide-react";
import { demoFitZonePlans } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/planos")({ component: Planos });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Planos() {
  const totalAlunos = demoFitZonePlans.reduce((s, p) => s + p.alunos, 0);
  const mrr = demoFitZonePlans.reduce((s, p) => s + (p.alunos * (p.duration === "Anual" ? p.price/12 : p.duration === "Trimestral" ? p.price/3 : p.duration === "Semestral" ? p.price/6 : p.price)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Planos</h1>
          <p className="text-sm text-zinc-500 mt-1">{demoFitZonePlans.length} planos ativos · {totalAlunos} alunos vinculados · MRR {fmtBRL(mrr)}</p>
        </div>
        <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo plano</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {demoFitZonePlans.map(p => (
          <Card key={p.id} className={`border-zinc-200 shadow-sm hover:shadow-md transition relative overflow-hidden ${p.featured ? "ring-2 ring-[#F97316] ring-offset-2" : ""}`}>
            {p.featured && <div className="absolute top-0 right-0 bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><Crown className="h-3 w-3" />DESTAQUE</div>}
            <CardContent className="p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">{p.duration}</div>
              <h3 className="text-xl font-black text-zinc-900 mt-1">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black bg-gradient-to-r from-[#F97316] to-[#FACC15] bg-clip-text text-transparent">{fmtBRL(p.price)}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map(f => <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-emerald-500 mt-0.5" /><span className="text-zinc-700">{f}</span></li>)}
              </ul>
              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-zinc-600"><Users className="h-4 w-4" /><span className="font-bold text-zinc-900">{p.alunos}</span> alunos</div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
