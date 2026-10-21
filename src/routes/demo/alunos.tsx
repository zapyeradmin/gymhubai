import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Phone, Eye, MessageCircle } from "lucide-react";
import { demoFitZoneStudents } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/alunos")({ component: Alunos });

const statusBadge = (s: string) => ({
  ativo:           "bg-emerald-100 text-emerald-700 border-emerald-200",
  novo:            "bg-blue-100 text-blue-700 border-blue-200",
  plano_vencendo:  "bg-amber-100 text-amber-700 border-amber-200",
  inativo:         "bg-red-100 text-red-700 border-red-200",
}[s] ?? "bg-zinc-100 text-zinc-700");

const statusLabel = (s: string) => ({ ativo:"Ativo", novo:"Novo", plano_vencendo:"Vencendo", inativo:"Inativo" }[s] ?? s);

function avatarInitial(name: string) {
  const i = name.split(" ").map(x => x[0]).slice(0,2).join("").toUpperCase();
  return i;
}

function Alunos() {
  const [filter, setFilter] = useState<string>("todos");
  const [q, setQ] = useState("");

  const filtered = demoFitZoneStudents.filter(s => {
    if (filter !== "todos" && s.status !== filter) return false;
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = {
    todos: demoFitZoneStudents.length,
    ativo: demoFitZoneStudents.filter(s => s.status === "ativo").length,
    novo: demoFitZoneStudents.filter(s => s.status === "novo").length,
    plano_vencendo: demoFitZoneStudents.filter(s => s.status === "plano_vencendo").length,
    inativo: demoFitZoneStudents.filter(s => s.status === "inativo").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Alunos</h1>
          <p className="text-sm text-zinc-500 mt-1">{demoFitZoneStudents.length} alunos cadastrados · 287 ativos no total</p>
        </div>
        <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo aluno</Button>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome, CPF, telefone..." className="pl-9 h-10" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["todos","ativo","novo","plano_vencendo","inativo"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`px-3 h-10 rounded-md text-sm font-semibold border transition ${filter===s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"}`}>
                  {s === "todos" ? "Todos" : statusLabel(s)} <span className={`ml-1.5 text-xs ${filter===s ? "text-white/60" : "text-zinc-400"}`}>{counts[s]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-zinc-500 text-left border-b border-zinc-200">
                  <th className="py-3 pl-2">Aluno</th>
                  <th className="py-3">Contato</th>
                  <th className="py-3">Plano</th>
                  <th className="py-3">Status / Tags</th>
                  <th className="py-3">Última entrada</th>
                  <th className="py-3">Check-ins mês</th>
                  <th className="py-3">Vencimento</th>
                  <th className="py-3 pr-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#F97316] to-[#FACC15] flex items-center justify-center text-white text-xs font-bold">{avatarInitial(s.name)}</div>
                        <div className="font-bold text-zinc-900">{s.name}</div>
                      </div>
                    </td>
                    <td className="py-3"><div className="flex items-center gap-1.5 text-zinc-600"><Phone className="h-3.5 w-3.5 text-emerald-600" /><span className="text-xs">{s.phone}</span></div></td>
                    <td className="py-3"><div className="text-xs font-semibold text-zinc-900">{s.plan_name}</div><div className="text-xs text-zinc-500">R$ {s.valor_pago.toFixed(2)}</div></td>
                    <td className="py-3">
                      <Badge className={`${statusBadge(s.status)} border text-[10px] mb-1`}>{statusLabel(s.status)}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {s.tags.slice(0,2).map(t => <span key={t} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    </td>
                    <td className="py-3"><span className={`text-xs font-bold ${s.last_checkin_days > 14 ? "text-red-600" : "text-zinc-700"}`}>{s.last_checkin_days === 0 ? "Hoje" : `${s.last_checkin_days}d atrás`}</span></td>
                    <td className="py-3"><span className="text-xs font-bold text-zinc-900">{s.checkin_count_month}</span></td>
                    <td className="py-3"><span className={`text-xs font-bold ${s.plan_end_days <= 7 ? "text-amber-600" : "text-zinc-700"}`}>{s.plan_end_days}d</span></td>
                    <td className="py-3 pr-2 text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8"><Eye className="h-3.5 w-3.5 mr-1" /> Ficha</Button>
                        </SheetTrigger>
                        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle>{s.name}</SheetTitle>
                          </SheetHeader>
                          <div className="flex items-center gap-4 py-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F97316] to-[#FACC15] flex items-center justify-center text-white text-xl font-bold">{avatarInitial(s.name)}</div>
                            <div>
                              <Badge className={`${statusBadge(s.status)} border mb-1`}>{statusLabel(s.status)}</Badge>
                              <div className="text-sm text-zinc-600">{s.plan_name}</div>
                              <div className="text-xs text-zinc-500">{s.phone}</div>
                            </div>
                          </div>
                          <Tabs defaultValue="dados" className="mt-2">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="dados">Dados</TabsTrigger>
                              <TabsTrigger value="treinos">Treinos</TabsTrigger>
                              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                            </TabsList>
                            <TabsContent value="dados" className="space-y-2 text-sm">
                              <Row k="Email" v={s.email} /><Row k="Telefone" v={s.phone} /><Row k="Nascimento" v={s.birth_date} /><Row k="Professor" v={s.professor} /><Row k="Última entrada" v={`${s.last_checkin_days}d atrás`} />
                            </TabsContent>
                            <TabsContent value="treinos" className="text-sm text-zinc-600 py-4">Plano de treino atual: Hipertrofia ABC · 4x/semana · Personal: {s.professor}</TabsContent>
                            <TabsContent value="avaliacoes" className="text-sm text-zinc-600 py-4">Última avaliação física há 45 dias. Próxima sugerida em 15 dias.</TabsContent>
                            <TabsContent value="financeiro" className="text-sm text-zinc-600 py-4">Mensalidade: R$ {s.valor_pago.toFixed(2)} · Próximo vencimento: em {s.plan_end_days} dias.</TabsContent>
                          </Tabs>
                          <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"><MessageCircle className="h-4 w-4 mr-2" /> Enviar WhatsApp</Button>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between py-1.5 border-b border-zinc-100"><span className="text-zinc-500">{k}</span><span className="text-zinc-900 font-medium">{v}</span></div>;
}
