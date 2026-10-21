import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ScanLine, TrendingUp, TrendingDown, Wallet, AlertCircle, Calendar, Cake, Crown, Activity, MessageCircle, Sparkles, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import {
  demoFitZoneKpis as K,
  demoFitZoneCheckinsByDay,
  demoFitZonePlans,
  demoFitZoneCheckinsHoje,
  demoFitZoneVencendo,
  demoFitZoneAniversariantes,
} from "@/lib/demo-data";

export const Route = createFileRoute("/demo/dashboard")({ component: Dash });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
const PLAN_COLORS = ["#F97316", "#FACC15", "#10B981", "#3B82F6", "#A855F7"];

function Dash() {
  const planData = demoFitZonePlans.map(p => ({ name: p.name.replace("Mensal ", "").replace("Trimestral ", "Trim. ").replace("Semestral ", "Sem. "), value: p.alunos }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">FitZone Performance · Avenida Paulista, 1000</p>
      </div>

      {/* AI Alerts banner */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <AlertCard tone="red"     icon={AlertCircle} title="4 inativos +30d" sub="Reativar gera R$ 1.800" cta="Reativar" />
        <AlertCard tone="amber"   icon={Calendar}    title="12 planos vencendo" sub="R$ 4.600 em risco essa semana" cta="Renovar agora" />
        <AlertCard tone="orange"  icon={TrendingDown}title="Carlos Mendes -60%" sub="Frequência despencou. Conversar?" cta="Mensagem" />
        <AlertCard tone="emerald" icon={TrendingUp}  title="Recorde diário!" sub="142 check-ins hoje (+18% vs média)" cta="Ver detalhes" />
      </div>

      {/* 8 KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi color="from-orange-500 to-orange-600"     icon={Users}       label="Alunos Ativos"   value={K.alunosAtivos.toString()} delta={`+${K.novosMes} este mês`} />
        <Kpi color="from-emerald-500 to-emerald-600"   icon={Wallet}      label="MRR"             value={fmtBRL(K.mrr)}     delta="+12% MoM" />
        <Kpi color="from-rose-500 to-rose-600"         icon={ScanLine}    label="Check-ins hoje"  value={K.checkinsHoje.toString()} delta="+18% vs média" />
        <Kpi color="from-amber-500 to-amber-600"       icon={Activity}    label="Frequência média" value={`${K.frequenciaMedia}/mês`} delta="+1.2 vs trim. ant." />
        <Kpi color="from-blue-500 to-blue-600"         icon={Wallet}      label="A Receber"       value={fmtBRL(K.aReceber)} delta="-15% MoM (cobrança AI)" />
        <Kpi color="from-violet-500 to-violet-600"     icon={AlertCircle} label="Inadimplência"   value={`${(K.inadimplenciaRate*100).toFixed(0)}%`} delta={`-2% — ${fmtBRL(K.inadimplencia)}`} />
        <Kpi color="from-indigo-500 to-indigo-600"     icon={TrendingDown}label="Churn rate"      value={`${(K.churnRate*100).toFixed(0)}%`} delta="-1% vs trim. ant." />
        <Kpi color="from-[#F97316] to-[#FACC15]"       icon={Crown}       label="Taxa Retenção"   value={`${(K.taxaRetencao*100).toFixed(0)}%`} delta="+3% — top 5% do setor" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900">Check-ins · últimos 14 dias</h3>
              <Badge className="bg-orange-100 text-orange-700 border-0">média 127/dia</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={demoFitZoneCheckinsByDay}>
                  <defs>
                    <linearGradient id="grad-orange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FACC15" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="url(#grad-orange)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-zinc-900 mb-4">Distribuição por plano</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                    {planData.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {planData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                  <span className="text-zinc-700 truncate">{p.name}</span>
                  <span className="text-zinc-500 ml-auto font-medium">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-ins de hoje */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900">Check-ins de hoje</h3>
            <Link to="/demo/checkins" className="text-xs text-[#F97316] font-semibold hover:underline">Ver todos os 142 →</Link>
          </div>
          <div className="space-y-2">
            {demoFitZoneCheckinsHoje.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                <img src={c.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-zinc-900">{c.student_name}</div>
                  <div className="text-xs text-zinc-500 truncate">{c.plan_name} · prof. {c.professor}</div>
                </div>
                <Badge variant="outline" className="border-zinc-200 text-zinc-700 text-xs">{c.modalidade}</Badge>
                <div className="text-xs font-mono text-zinc-500 w-12 text-right">{c.hora}</div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">ENTRADA</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renovações + Aniversariantes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900">⏰ Planos perto do vencimento</h3>
              <Badge className="bg-amber-100 text-amber-700 border-0">{demoFitZoneVencendo.length} alunos</Badge>
            </div>
            <div className="space-y-2">
              {demoFitZoneVencendo.map(v => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div>
                    <div className="font-semibold text-sm text-zinc-900">{v.name}</div>
                    <div className="text-xs text-zinc-500">{v.plan_name} · {fmtBRL(v.valor)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${v.dias <= 3 ? "text-red-600" : "text-amber-600"}`}>
                      {v.dias === 1 ? "Vence amanhã" : `${v.dias}d`}
                    </span>
                    <Button size="sm" className="h-7 bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90">Renovar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Cake className="h-4 w-4 text-pink-500" />Aniversariantes da semana</h3>
              <Badge className="bg-pink-100 text-pink-700 border-0">{demoFitZoneAniversariantes.length}</Badge>
            </div>
            <div className="space-y-2">
              {demoFitZoneAniversariantes.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div>
                    <div className="font-semibold text-sm text-zinc-900">{a.name}</div>
                    <div className="text-xs text-zinc-500">{a.plan_name} · {a.idade} anos</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-pink-600">{a.date}</span>
                    <Button size="sm" variant="outline" className="h-7 border-pink-200 text-pink-700 hover:bg-pink-50"><MessageCircle className="h-3 w-3 mr-1" />Parabenizar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Banner */}
      <Card className="border-0 bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#18181B] text-white overflow-hidden relative">
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FACC15] flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FACC15] font-bold">AI GROWTH ENGINE</div>
                <h3 className="text-2xl font-black">6 oportunidades detectadas hoje</h3>
                <p className="text-sm text-white/60 mt-1">Receita potencial recuperável: <span className="text-[#FACC15] font-bold">R$ 14.200</span></p>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-11 px-6 font-bold">
              <Link to="/demo/aigrowth">Abrir AI Growth <ArrowUpRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ color, icon: Icon, label, value, delta }: { color: string; icon: typeof Users; label: string; value: string; delta: string }) {
  return (
    <Card className="border-zinc-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-black text-zinc-900">{value}</div>
        <div className="text-xs text-zinc-500 mt-1">{delta}</div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ tone, icon: Icon, title, sub, cta }: { tone: "red"|"amber"|"orange"|"emerald"; icon: typeof Users; title: string; sub: string; cta: string }) {
  const map = {
    red:     { bg:"bg-red-50",     bd:"border-red-200",     ic:"bg-red-500",     tx:"text-red-900", st:"text-red-700" },
    amber:   { bg:"bg-amber-50",   bd:"border-amber-200",   ic:"bg-amber-500",   tx:"text-amber-900", st:"text-amber-700" },
    orange:  { bg:"bg-orange-50",  bd:"border-orange-200",  ic:"bg-orange-500",  tx:"text-orange-900", st:"text-orange-700" },
    emerald: { bg:"bg-emerald-50", bd:"border-emerald-200", ic:"bg-emerald-500", tx:"text-emerald-900", st:"text-emerald-700" },
  }[tone];
  return (
    <Card className={`${map.bg} ${map.bd} border shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-9 w-9 rounded-lg ${map.ic} flex items-center justify-center shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold ${map.tx}`}>{title}</div>
            <div className={`text-xs ${map.st} mt-0.5`}>{sub}</div>
            <button className={`text-xs font-bold ${map.tx} mt-2 hover:underline`}>{cta} →</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
