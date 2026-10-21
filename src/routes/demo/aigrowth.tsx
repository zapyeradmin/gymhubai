import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, ChevronUp, Copy, Wand2, Send, TrendingUp } from "lucide-react";
import { demoFitZoneAiOps } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/aigrowth")({ component: AIGrowth });

const severityClass = (color: string) => ({
  red:    "bg-red-100 text-red-700 border-red-200",
  amber:  "bg-amber-100 text-amber-700 border-amber-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  blue:   "bg-blue-100 text-blue-700 border-blue-200",
}[color] ?? "bg-zinc-100 text-zinc-700");

function AIGrowth() {
  const [open, setOpen] = useState<string | null>(demoFitZoneAiOps[0].id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">AI Growth Engine</h1>
            <Badge className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 font-bold">BETA</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">IA que detecta queda de frequência, vencimentos e oportunidades de receita.</p>
        </div>
      </div>

      {/* Receita potencial */}
      <Card className="border-0 bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#18181B] text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FACC15] flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FACC15] font-bold">RECEITA POTENCIAL</div>
                <h3 className="text-3xl font-black">R$ 14.200 recuperáveis</h3>
                <p className="text-sm text-white/60 mt-1">Distribuídos em 5 oportunidades. Execute em 1 clique.</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-11 px-6 font-bold">
              <Send className="h-4 w-4 mr-2" /> Executar todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades */}
      <div className="space-y-3">
        {demoFitZoneAiOps.map(op => {
          const isOpen = open === op.id;
          return (
            <Card key={op.id} className="border-zinc-200 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : op.id)} className="w-full text-left">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F97316]/10 to-[#FACC15]/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-zinc-900">{op.title}</h3>
                      <Badge className={`${severityClass(op.color)} border font-bold text-[10px]`}>{op.severity}</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">{op.descricao}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{op.impacto}</div>
                    <div className="text-xs text-zinc-400">{op.targets.length} alunos</div>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                </CardContent>
              </button>

              {isOpen && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-5 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Alunos identificados</div>
                    <div className="space-y-1.5">
                      {op.targets.map((t, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-zinc-100">
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">{t.name}</div>
                            <div className="text-xs text-zinc-500">{t.phone} · {t.info}</div>
                          </div>
                          {t.valor > 0 && <Badge variant="outline" className="border-emerald-200 text-emerald-700">R$ {t.valor.toFixed(2)}</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mensagem WhatsApp pronta</div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-zinc-800 italic">
                      "{op.template}"
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="border-zinc-300"><Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar</Button>
                    <Button size="sm" variant="outline" className="border-zinc-300"><Wand2 className="h-3.5 w-3.5 mr-1.5" /> Gerar com IA</Button>
                    <Button size="sm" className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90">
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Disparar para {op.targets.length} alunos
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
