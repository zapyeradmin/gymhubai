import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail } from "lucide-react";
import { demoFitZoneTeam } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/equipe")({ component: Equipe });

function Equipe() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Equipe</h1>
          <p className="text-sm text-zinc-500 mt-1">{demoFitZoneTeam.length} membros ativos</p>
        </div>
        <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo membro</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoFitZoneTeam.map(m => (
          <Card key={m.id} className="border-zinc-200 shadow-sm hover:shadow-md transition"><CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#FACC15] flex items-center justify-center text-white font-bold">{m.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
              <div>
                <div className="font-bold text-zinc-900">{m.name}</div>
                <Badge className="bg-zinc-100 text-zinc-700 border-0 text-[10px] mt-0.5">{m.role}</Badge>
              </div>
            </div>
            <div className="text-xs text-zinc-600 space-y-1">
              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{m.email}</div>
              <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{m.phone}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-zinc-500">Alunos</div><div className="font-bold text-zinc-900">{m.alunos_resp}</div></div>
              <div><div className="text-zinc-500">Comissão</div><div className="font-bold text-zinc-900">{m.comissao}%</div></div>
              <div><div className="text-zinc-500">Especialidade</div><div className="font-bold text-zinc-900 truncate">{m.specialty}</div></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
