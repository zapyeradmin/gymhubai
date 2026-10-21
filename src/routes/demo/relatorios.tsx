import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Crown } from "lucide-react";
import { demoFitZoneMrrEvolution, demoFitZonePlans, demoFitZoneTopProfessores, demoFitZoneTopModalidades, demoFitZoneKpis as K } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/relatorios")({ component: Rel });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

function Rel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Relatórios</h1>
        <p className="text-sm text-zinc-500 mt-1">Visão estratégica — MRR, Churn, Retenção, Ranking equipe</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="MRR atual" value={fmtBRL(K.mrr)} sub="+12% MoM" tone="emerald" />
        <MetricCard label="Churn rate" value={`${(K.churnRate*100).toFixed(0)}%`} sub="-1% trim. ant." tone="rose" />
        <MetricCard label="Retenção" value={`${(K.taxaRetencao*100).toFixed(0)}%`} sub="Top 5% setor" tone="orange" />
        <MetricCard label="Ticket médio" value={fmtBRL(K.ticketMedio)} sub="Plano + extras" tone="violet" />
      </div>

      <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
        <h3 className="font-bold text-zinc-900 mb-4">Evolução MRR · 12 meses</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={demoFitZoneMrrEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mes" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${v/1000}k`} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="mrr" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
          <h3 className="font-bold text-zinc-900 mb-4">Receita por plano</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={demoFitZonePlans.map(p => ({ name: p.name.split(" ")[0], receita: p.alunos * p.price / (p.duration === "Anual" ? 12 : p.duration === "Trimestral" ? 3 : p.duration === "Semestral" ? 6 : 1) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="receita" fill="#F97316" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
          <h3 className="font-bold text-zinc-900 mb-4">Top modalidades · check-ins mês</h3>
          <div className="space-y-2">
            {demoFitZoneTopModalidades.map(m => (
              <div key={m.modalidade}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700">{m.modalidade}</span>
                  <span className="text-zinc-500">{m.checkins} <span className="text-zinc-400">({m.pct}%)</span></span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#F97316] to-[#FACC15]" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>

      <Card className="border-zinc-200 shadow-sm"><CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Ranking professores · abril</h3>
          <Badge className="bg-zinc-100 text-zinc-700 border-0">comissão sobre alunos vinculados</Badge>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-zinc-500 text-left border-b border-zinc-200">
              <th className="py-2.5">#</th><th className="py-2.5">Professor</th><th className="py-2.5">Alunos</th><th className="py-2.5">Check-ins mês</th><th className="py-2.5 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {demoFitZoneTopProfessores.map((p, i) => (
              <tr key={p.name} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                <td className="py-3 font-bold text-zinc-400">{i+1}º</td>
                <td className="py-3 font-bold text-zinc-900">{p.name}</td>
                <td className="py-3 text-zinc-700">{p.alunos}</td>
                <td className="py-3 text-zinc-700">{p.checkins_mes}</td>
                <td className="py-3 text-right font-bold text-emerald-600">{fmtBRL(p.comissao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}

function MetricCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "emerald"|"rose"|"orange"|"violet" }) {
  const tx = { emerald: "text-emerald-600", rose: "text-rose-600", orange: "text-orange-600", violet: "text-violet-600" }[tone];
  return (
    <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-3xl font-black mt-1 ${tx}`}>{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{sub}</div>
    </CardContent></Card>
  );
}
