import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL, fmtDate } from "@/lib/format";
import { format, startOfMonth } from "date-fns";

export const Route = createFileRoute("/app/financeiro")({ component: Financeiro });

function Financeiro() {
  const { tenant } = useTenant(); const aid = tenant?.academyId; const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "receita" as "receita"|"despesa", category: "", description: "", amount: 0, date: format(new Date(), "yyyy-MM-dd") });
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: rows } = useQuery({
    queryKey: ["financial", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("financial").select("*").eq("academy_id", aid!).gte("date", monthStart).order("date", { ascending: false })).data ?? [],
  });

  const kpis = useMemo(() => {
    const r = rows ?? [];
    const recebida   = r.filter(x => x.type === "receita" && x.status === "pago").reduce((s,x) => s + Number(x.amount), 0);
    const prevista   = r.filter(x => x.type === "receita").reduce((s,x) => s + Number(x.amount), 0);
    const inad       = r.filter(x => x.type === "receita" && x.status === "pendente").reduce((s,x) => s + Number(x.amount), 0);
    const despesas   = r.filter(x => x.type === "despesa").reduce((s,x) => s + Number(x.amount), 0);
    return { recebida, prevista, inad, lucro: recebida - despesas };
  }, [rows]);

  const receitas = (rows ?? []).filter(r => r.type === "receita");
  const despesas = (rows ?? []).filter(r => r.type === "despesa");
  const inadimplencia = (rows ?? []).filter(r => r.type === "receita" && r.status === "pendente");

  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("financial").insert({ ...form, academy_id: aid! }); if (error) throw error; },
    onSuccess: () => { toast.success("Lançamento registrado"); setOpen(false); qc.invalidateQueries({ queryKey: ["financial"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Financeiro" description="Controle de receitas, despesas e inadimplência do mês." actions={
        <Button onClick={() => setOpen(true)} className="bg-[#D97634] hover:bg-[#D97634]/90"><Plus className="h-4 w-4" />Novo lançamento</Button>
      } />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard label="Receita prevista" value={fmtBRL(kpis.prevista)} icon={Wallet} />
        <KpiCard label="Receita recebida" value={fmtBRL(kpis.recebida)} icon={TrendingUp} hint="Confirmadas" />
        <Card className={kpis.inad ? "border-red-500/30" : ""}><CardContent className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground font-medium">Inadimplência</span><AlertTriangle className={`h-4 w-4 ${kpis.inad ? "text-red-600" : "text-muted-foreground"}`} /></div>
          <div className={`mt-2 text-3xl font-bold ${kpis.inad ? "text-red-600" : ""}`}>{fmtBRL(kpis.inad)}</div>
        </CardContent></Card>
        <Card className={kpis.lucro >= 0 ? "border-emerald-500/30" : "border-red-500/30"}><CardContent className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground font-medium">Lucro do mês</span>{kpis.lucro >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}</div>
          <div className={`mt-2 text-3xl font-bold ${kpis.lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtBRL(kpis.lucro)}</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="receitas">
        <TabsList><TabsTrigger value="receitas">Receitas</TabsTrigger><TabsTrigger value="despesas">Despesas</TabsTrigger><TabsTrigger value="inad">Inadimplência</TabsTrigger></TabsList>
        <TabsContent value="receitas"><FinTable rows={receitas} /></TabsContent>
        <TabsContent value="despesas"><FinTable rows={despesas} /></TabsContent>
        <TabsContent value="inad">
          <FinTable rows={inadimplencia} action />
        </TabsContent>
      </Tabs>

      <FormDialog open={open} onOpenChange={setOpen} title="Novo lançamento">
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate();}} className="space-y-3">
          <div><Label>Tipo</Label>
            <select className="w-full border border-border rounded-md h-9 px-2" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value as any})}>
              <option value="receita">Receita</option><option value="despesa">Despesa</option>
            </select>
          </div>
          <div><Label>Categoria</Label><Input value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} /></div>
          <div><Label>Descrição</Label><Input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} /></div>
          <div><Label>Valor</Label><Input type="number" step="0.01" value={form.amount} onChange={(e)=>setForm({...form, amount: Number(e.target.value)})} required /></div>
          <div><Label>Data</Label><Input type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} required /></div>
          <Button type="submit" className="w-full bg-[#D97634] hover:bg-[#D97634]/90" disabled={create.isPending}>Salvar</Button>
        </form>
      </FormDialog>
    </div>
  );
}

function FinTable({ rows, action }: { rows: any[]; action?: boolean }) {
  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Categoria</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead>{action && <TableHead></TableHead>}</TableRow></TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id}>
              <TableCell>{fmtDate(r.date)}</TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell>{r.description}</TableCell>
              <TableCell className={`text-right font-medium ${r.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>{fmtBRL(r.amount)}</TableCell>
              <TableCell><Badge variant={r.status === "pago" ? "default" : "secondary"} className={r.status === "pago" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>{r.status}</Badge></TableCell>
              {action && <TableCell><Button size="sm" variant="outline">Cobrar</Button></TableCell>}
            </TableRow>
          ))}
          {!rows.length && <TableRow><TableCell colSpan={action ? 6 : 5} className="text-center text-muted-foreground py-8">Nenhum lançamento</TableCell></TableRow>}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}
