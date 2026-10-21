import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { demoFaturamento12m, demoTopModalidades, demoAlunosEvolution12m, demoCheckinsByHour } from "@/lib/demo-data";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/app/relatorios")({ component: RelatoriosPage });

const COLORS = ["#D97634", "#E8935D", "#22C55E", "#3B82F6", "#A855F7", "#EAB308", "#EC4899", "#06B6D4"];

function RelatoriosPage() {
  const faturamento = demoFaturamento12m();
  const modalidades = demoTopModalidades();
  const evolucao = demoAlunosEvolution12m();
  const horarios = demoCheckinsByHour();

  // Retenção sintetica
  const retencao = evolucao.map((e, i) => ({ month: e.month, retencao: 78 + (i % 12) }));

  return (
    <div className="print:p-0">
      <div className="flex items-start justify-between print:hidden">
        <PageHeader title="Relatórios" description="Visão completa de desempenho da academia." />
        <Button onClick={() => window.print()} className="gap-2 bg-[#D97634] hover:bg-[#D97634]/90"><Printer className="h-4 w-4" /> Exportar PDF</Button>
      </div>
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Relatório Gym Hub</h1>
        <p className="text-sm text-muted-foreground">Gerado em {new Date().toLocaleString("pt-BR")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-1">Faturamento últimos 12 meses</h3>
          <p className="text-xs text-muted-foreground mb-3">Receita vs Despesa</p>
          <div className="h-72"><ResponsiveContainer>
            <BarChart data={faturamento}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => `R$${v/1000}k`} /><Tooltip formatter={(v: any) => fmtBRL(Number(v))} /><Legend />
              <Bar dataKey="receita" fill="#22C55E" radius={[4,4,0,0]} />
              <Bar dataKey="despesa" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-1">Retenção mensal</h3>
          <p className="text-xs text-muted-foreground mb-3">% de alunos retidos</p>
          <div className="h-72"><ResponsiveContainer>
            <LineChart data={retencao}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" /><YAxis domain={[60, 100]} /><Tooltip />
              <Line type="monotone" dataKey="retencao" stroke="#D97634" strokeWidth={3} dot={{ fill: "#D97634" }} />
            </LineChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-1">Top modalidades</h3>
          <p className="text-xs text-muted-foreground mb-3">Check-ins por modalidade</p>
          <div className="h-72"><ResponsiveContainer>
            <PieChart>
              <Pie data={modalidades} dataKey="checkins" nameKey="modalidade" cx="50%" cy="50%" outerRadius={90} label>
                {modalidades.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-1">Horários mais cheios</h3>
          <p className="text-xs text-muted-foreground mb-3">Check-ins por hora do dia</p>
          <div className="h-72"><ResponsiveContainer>
            <BarChart data={horarios}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="hour" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#D97634" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-1">Evolução de alunos</h3>
          <p className="text-xs text-muted-foreground mb-3">Base ativa nos últimos 12 meses</p>
          <div className="h-64"><ResponsiveContainer>
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="alunos" stroke="#D97634" strokeWidth={3} dot={{ fill: "#D97634" }} />
            </LineChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
      </div>
    </div>
  );
}
