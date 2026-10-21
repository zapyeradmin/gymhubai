import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/demo/agenda")({ component: Agenda });

const dias = ["Seg","Ter","Qua","Qui","Sex","Sab"];
const horarios = ["06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00"];

const aulas: Record<string, { nome:string; prof:string; mod:string; vagas:string; color:string } | undefined> = {
  "Seg-06:00": { nome:"Crossfit", prof:"Ricardo", mod:"Crossfit", vagas:"12/15", color:"bg-red-100 text-red-700 border-red-200" },
  "Seg-18:00": { nome:"Funcional", prof:"Ricardo", mod:"Funcional", vagas:"18/20", color:"bg-orange-100 text-orange-700 border-orange-200" },
  "Ter-08:00": { nome:"Pilates", prof:"Bruna", mod:"Pilates", vagas:"8/10", color:"bg-emerald-100 text-emerald-700 border-emerald-200" },
  "Ter-18:00": { nome:"Spinning", prof:"Ricardo", mod:"Spinning", vagas:"14/16", color:"bg-blue-100 text-blue-700 border-blue-200" },
  "Qua-06:00": { nome:"Crossfit", prof:"Ricardo", mod:"Crossfit", vagas:"13/15", color:"bg-red-100 text-red-700 border-red-200" },
  "Qua-18:00": { nome:"Funcional", prof:"Ricardo", mod:"Funcional", vagas:"20/20", color:"bg-orange-100 text-orange-700 border-orange-200" },
  "Qui-08:00": { nome:"Yoga", prof:"Bruna", mod:"Yoga", vagas:"6/10", color:"bg-violet-100 text-violet-700 border-violet-200" },
  "Qui-18:00": { nome:"Funcional", prof:"Ricardo", mod:"Funcional", vagas:"17/20", color:"bg-orange-100 text-orange-700 border-orange-200" },
  "Sex-18:00": { nome:"Crossfit", prof:"Ricardo", mod:"Crossfit", vagas:"15/15", color:"bg-red-100 text-red-700 border-red-200" },
  "Sab-10:00": { nome:"Pilates", prof:"Bruna", mod:"Pilates", vagas:"7/10", color:"bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function Agenda() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Agenda</h1>
          <p className="text-sm text-zinc-500 mt-1">Grade semanal · turmas em grupo, avaliações e retornos</p>
        </div>
        <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Nova aula</Button>
      </div>

      <Tabs defaultValue="aulas">
        <TabsList>
          <TabsTrigger value="aulas">Aulas em grupo</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações físicas</TabsTrigger>
          <TabsTrigger value="retornos">Retornos</TabsTrigger>
        </TabsList>
        <TabsContent value="aulas" className="mt-4">
          <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr>
                <th className="text-xs uppercase tracking-wider text-zinc-500 text-left py-2 w-20">Horário</th>
                {dias.map(d => <th key={d} className="text-xs uppercase tracking-wider text-zinc-500 text-left py-2 px-2">{d}</th>)}
              </tr></thead>
              <tbody>
                {horarios.map(h => (
                  <tr key={h} className="border-t border-zinc-100">
                    <td className="py-3 text-xs font-mono font-bold text-zinc-600">{h}</td>
                    {dias.map(d => {
                      const a = aulas[`${d}-${h}`];
                      return (
                        <td key={d} className="py-2 px-1 align-top">
                          {a ? (
                            <div className={`${a.color} border rounded-lg p-2 cursor-pointer hover:shadow-sm transition`}>
                              <div className="text-xs font-bold">{a.nome}</div>
                              <div className="text-[10px] opacity-80">{a.prof}</div>
                              <div className="text-[10px] font-mono mt-1">{a.vagas}</div>
                            </div>
                          ) : <div className="h-14 border border-dashed border-zinc-200 rounded-lg" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="avaliacoes" className="mt-4">
          <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
            <div className="space-y-2">
              {[{a:"Camila Santos",d:"hoje 14:00",p:"Bruna"},{a:"Felipe Dias",d:"amanhã 09:30",p:"Ricardo"},{a:"Diego Andrade",d:"qua 18:00",p:"Ricardo"}].map((x,i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                  <div><div className="font-bold text-zinc-900">{x.a}</div><div className="text-xs text-zinc-500">prof. {x.p}</div></div>
                  <Badge className="bg-violet-100 text-violet-700 border-0">{x.d}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="retornos" className="mt-4">
          <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
            <div className="space-y-2">
              {[{a:"Rafael Souza",d:"sex 10:00"},{a:"Patrícia Lima",d:"seg 18:00"}].map((x,i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                  <div className="font-bold text-zinc-900">{x.a}</div>
                  <Badge className="bg-blue-100 text-blue-700 border-0">{x.d}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
