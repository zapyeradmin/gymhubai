import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { demoFitZoneKpis as K, demoFitZoneReceitaVsDespesa6m, demoFitZoneFinanceiro } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/financeiro")({ component: Fin });

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
const stBadge = (s: string) => ({
  pago: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  atrasado: "bg-red-100 text-red-700 border-red-200",
}[s] ?? "");

function Fin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Financeiro</h1>
        <p className="text-sm text-zinc-500 mt-1">Visão consolidada do mês corrente · Abril/2026</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinCard color="from-emerald-500 to-emerald-600" icon={TrendingUp}   label="Receitas Mês"   value={fmtBRL(K.receitaMes)}     delta="+8.2% vs Fev" />
        <FinCard color="from-blue-500 to-blue-600"       icon={Wallet}       label="A Receber"      value={fmtBRL(K.aReceber)}       delta="11 mensalidades" />
        <FinCard color="from-red-500 to-red-600"         icon={AlertCircle}  label="Inadimplência"  value={fmtBRL(K.inadimplencia)}  delta={`${(K.inadimplenciaRate*100).toFixed(0)}% da base`} />
        <FinCard color="from-[#F97316] to-[#FACC15]"     icon={TrendingDown} label="Lucro Mês"      value={fmtBRL(K.lucroMes)}       delta={`Despesas ${fmtBRL(K.despesasMes)}`} />
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-zinc-900 mb-4">Receitas vs Despesas · últimos 6 meses</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={demoFitZoneReceitaVsDespesa6m}>
                <defs>
                  <linearGradient id="grR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F97316" /><stop offset="100%" stopColor="#FACC15" /></linearGradient>
                  <linearGradient id="grD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#60A5FA" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="mes" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={v=>`${v/1000}k`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="url(#grR)" radius={[6,6,0,0]} />
                <Bar dataKey="despesa" name="Despesa" fill="url(#grD)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="receitas">
            <TabsList>
              <TabsTrigger value="receitas">Receitas ({demoFitZoneFinanceiro.receitas.length})</TabsTrigger>
              <TabsTrigger value="despesas">Despesas ({demoFitZoneFinanceiro.despesas.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="receitas" className="mt-4">
              <Table rows={demoFitZoneFinanceiro.receitas.map(r => ({ desc: r.desc, cat: r.cat, valor: r.valor, data: r.data, status: r.status }))} />
            </TabsContent>
            <TabsContent value="despesas" className="mt-4">
              <Table rows={demoFitZoneFinanceiro.despesas.map(d => ({ desc: d.desc, cat: d.cat, valor: d.valor, data: d.data, status: d.status }))} negative />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function FinCard({ color, icon: Icon, label, value, delta }: { color: string; icon: typeof Wallet; label: string; value: string; delta: string }) {
  return (
    <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}><Icon className="h-4 w-4 text-white" /></div>
      </div>
      <div className="text-2xl font-black text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{delta}</div>
    </CardContent></Card>
  );
}

function Table({ rows, negative }: { rows: { desc:string; cat:string; valor:number; data:string; status:string }[]; negative?: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-zinc-500 text-left border-b border-zinc-200">
          <th className="py-2.5">Descrição</th><th className="py-2.5">Categoria</th><th className="py-2.5">Data</th><th className="py-2.5">Status</th><th className="py-2.5 text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50">
            <td className="py-2.5 font-medium text-zinc-900">{r.desc}</td>
            <td className="py-2.5"><Badge variant="outline" className="border-zinc-200 text-zinc-600">{r.cat}</Badge></td>
            <td className="py-2.5 text-zinc-600">{r.data}</td>
            <td className="py-2.5"><Badge className={`${stBadge(r.status)} border text-[10px]`}>{r.status}</Badge></td>
            <td className={`py-2.5 text-right font-bold ${negative ? "text-red-600" : "text-emerald-600"}`}>{negative && "−"}R$ {r.valor.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
