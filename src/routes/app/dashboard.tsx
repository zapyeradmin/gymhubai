import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Users, ScanLine, Wallet, AlertTriangle, TrendingUp, UserPlus, CalendarCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { fmtBRL } from "@/lib/format";
import { format, subDays, startOfMonth } from "date-fns";
import { demoAulasHoje, demoAIOpportunities, demoAlunosEvolution12m } from "@/lib/demo-data";
import { BookingLinkCard } from "@/components/booking-link-card";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data } = useQuery({
    queryKey: ["dashboard", aid],
    enabled: !!aid,
    queryFn: async () => {
      const [students, todays, weeks, financial, last14, byHour, plans, newStudents, overdue] = await Promise.all([
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid!).eq("status", "active"),
        supabase.from("checkin").select("id", { count: "exact", head: true }).eq("academy_id", aid!).eq("date", today),
        supabase.from("checkin").select("id", { count: "exact", head: true }).eq("academy_id", aid!).gte("date", weekAgo),
        supabase.from("financial").select("amount,type,status").eq("academy_id", aid!).gte("date", monthStart),
        supabase.from("checkin").select("date").eq("academy_id", aid!).gte("date", format(subDays(new Date(), 13), "yyyy-MM-dd")),
        supabase.from("checkin").select("time").eq("academy_id", aid!).eq("date", today),
        supabase.from("student").select("plan_name").eq("academy_id", aid!),
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid!).gte("created_at", monthStart),
        supabase.from("student").select("id", { count: "exact", head: true }).eq("academy_id", aid!).eq("payment_status", "atrasado"),
      ]);
      const receita = (financial.data ?? []).filter(f => f.type === "receita" && f.status === "pago").reduce((s, f) => s + Number(f.amount), 0);
      const byDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) byDay[format(subDays(new Date(), i), "yyyy-MM-dd")] = 0;
      (last14.data ?? []).forEach((c) => { byDay[c.date] = (byDay[c.date] ?? 0) + 1; });
      const chart = Object.entries(byDay).map(([d, count]) => ({ date: format(new Date(d), "dd/MM"), count }));
      const hours: Record<string, number> = {};
      for (let h = 6; h <= 22; h++) hours[`${h}h`] = 0;
      (byHour.data ?? []).forEach((c) => { const h = `${parseInt(c.time.slice(0,2))}h`; if (hours[h] !== undefined) hours[h]++; });
      const hourChart = Object.entries(hours).map(([hour, count]) => ({ hour, count }));
      const planMap: Record<string, number> = {};
      (plans.data ?? []).forEach((s) => { planMap[s.plan_name ?? "Sem plano"] = (planMap[s.plan_name ?? "Sem plano"] ?? 0) + 1; });
      const planChart = Object.entries(planMap).map(([plan, count]) => ({ plan, count }));
      return {
        students: students.count ?? 0, todays: todays.count ?? 0, weeks: weeks.count ?? 0,
        receita, chart, hourChart, planChart,
        newStudents: newStudents.count ?? 0, overdue: overdue.count ?? 0,
      };
    },
  });

  const aulasHoje = demoAulasHoje();
  const ai = demoAIOpportunities.slice(0, 3);
  const evol = demoAlunosEvolution12m();
  const { data: slugRow } = useQuery({
    queryKey: ["academy-slug", aid],
    enabled: !!aid,
    queryFn: async () => {
      const { data } = await supabase.from("academy").select("slug").eq("id", aid!).maybeSingle();
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="Dashboard" description={`Bem-vindo${tenant?.academy?.name ? ` à ${tenant.academy.name}` : ""}.`} />
      {slugRow?.slug && <div className="mb-6"><BookingLinkCard slug={slugRow.slug} /></div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Check-ins hoje"        value={data?.todays ?? "—"}    icon={ScanLine} hint="Movimentação do dia" />
        <KpiCard label="Check-ins na semana"   value={data?.weeks ?? "—"}     icon={CalendarCheck} hint="Últimos 7 dias" />
        <KpiCard label="Alunos ativos"         value={data?.students ?? "—"}  icon={Users} />
        <KpiCard label="Novos cadastros (mês)" value={data?.newStudents ?? "—"} icon={UserPlus} />
        <KpiCard label="Faturamento (mês)"     value={fmtBRL(data?.receita ?? 0)} icon={Wallet} hint="Recebido este mês" />
        <Card className={data?.overdue ? "border-red-500/40 bg-red-50/40" : ""}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Mensalidades atrasadas</span>
              <AlertTriangle className={`h-4 w-4 ${data?.overdue ? "text-red-600" : "text-muted-foreground"}`} />
            </div>
            <div className={`mt-2 text-3xl font-bold ${data?.overdue ? "text-red-600" : ""}`}>{data?.overdue ?? "—"}</div>
            {!!data?.overdue && <div className="text-xs text-red-600 mt-1">Cobrar inadimplentes</div>}
          </CardContent>
        </Card>
        <KpiCard label="Taxa ocupação aulas" value="72%" icon={TrendingUp} hint="Média da semana" />
        <Card className="border-[#D97634]/30 bg-[#D97634]/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#D97634]">AI Alerts</span>
              <Sparkles className="h-4 w-4 text-[#D97634]" />
            </div>
            <div className="mt-2 text-3xl font-bold text-[#D97634]">{ai.length}</div>
            <div className="text-xs text-[#D97634]/80 mt-1">Oportunidades detectadas</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Check-ins por hora (hoje)</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={data?.hourChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="hour" /><YAxis allowDecimals={false} /><Tooltip />
              <Bar dataKey="count" fill="#D97634" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Alunos por plano</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={data?.planChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="plan" /><YAxis allowDecimals={false} /><Tooltip />
              <Bar dataKey="count" fill="#E8935D" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Evolução de alunos (12 meses)</h3>
          <div className="h-64"><ResponsiveContainer>
            <LineChart data={evol}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="alunos" stroke="#D97634" strokeWidth={3} dot={{ fill: "#D97634" }} />
            </LineChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Aulas de hoje</h3>
          {aulasHoje.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Nenhuma aula hoje</div>
          ) : (
            <div className="space-y-2">
              {aulasHoje.map(a => (
                <div key={a.id} className="flex items-center justify-between border border-border rounded-md p-3">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.instructor_name} • {a.start_time?.slice(0,5)}–{a.end_time?.slice(0,5)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{a.inscritos}/{a.max_capacity}</div>
                    <div className="text-xs text-muted-foreground">inscritos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>

        <Card className="border-[#D97634]/30"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#D97634]" />
            <h3 className="font-semibold">Alertas IA</h3>
          </div>
          <div className="space-y-3">
            {ai.map(o => (
              <div key={o.id} className="border-l-2 border-[#D97634] pl-3">
                <div className="text-sm font-medium">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.impact}</div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
