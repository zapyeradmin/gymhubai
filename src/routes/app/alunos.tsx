import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormDialog } from "@/components/form-dialog";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/app/alunos")({ component: Alunos });

function Alunos() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", plan_name: "", birth_date: "", emergency_contact: "", medical_notes: "" });

  const { data: rows } = useQuery({
    queryKey: ["students", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("student").select("*").eq("academy_id", aid!).order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = useMemo(() => (rows ?? []).filter(r => {
    if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) && !r.cpf?.includes(search)) return false;
    if (planFilter && r.plan_name !== planFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (paymentFilter && r.payment_status !== paymentFilter) return false;
    return true;
  }), [rows, search, planFilter, statusFilter, paymentFilter]);

  const planos = Array.from(new Set((rows ?? []).map(r => r.plan_name).filter(Boolean)));

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        cpf: form.cpf.trim() || null,
        plan_name: form.plan_name.trim() || null,
        birth_date: form.birth_date.trim() || null,
        emergency_contact: form.emergency_contact.trim() || null,
        medical_notes: form.medical_notes.trim() || null,
      };
      const { error } = await supabase.from("student").insert({ ...payload, academy_id: aid! });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aluno cadastrado"); setOpen(false); setForm({ name: "", email: "", phone: "", cpf: "", plan_name: "", birth_date: "", emergency_contact: "", medical_notes: "" }); qc.invalidateQueries({ queryKey: ["students"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Alunos" description={`${filtered.length} aluno(s)`} actions={
        <Button onClick={() => setOpen(true)} className="bg-[#D97634] hover:bg-[#D97634]/90"><Plus className="h-4 w-4" />Novo aluno</Button>
      } />

      <Card className="mb-4"><CardContent className="p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <select className="h-9 px-3 border border-border rounded-md text-sm" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="">Todos planos</option>{planos.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="h-9 px-3 border border-border rounded-md text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos status</option><option value="active">Ativo</option><option value="trial">Trial</option><option value="blocked">Bloqueado</option>
        </select>
        <select className="h-9 px-3 border border-border rounded-md text-sm" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">Todo pagamento</option><option value="em_dia">Em dia</option><option value="atrasado">Atrasado</option>
        </select>
      </CardContent></Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(r => {
          const overdue = r.payment_status === "atrasado";
          return (
            <Card key={r.id} className={`cursor-pointer hover:shadow-md transition ${overdue ? "border-red-500/40" : ""}`} onClick={() => setDetail(r)}>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(r as any).photo_url} />
                  <AvatarFallback className="bg-[#D97634]/10 text-[#D97634] font-semibold">{r.name?.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.plan_name ?? "Sem plano"}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={r.status === "active" ? "default" : "secondary"} className={r.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>{r.status}</Badge>
                    {overdue && <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="h-3 w-3 mr-1" />Atrasado</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!filtered.length && <div className="col-span-full text-center text-muted-foreground py-12">Nenhum aluno encontrado</div>}
      </div>

      <FormDialog open={open} onOpenChange={setOpen} title="Novo aluno">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Nome *</Label><Input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} /></div>
            <div><Label>Telefone</Label><Input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} /></div>
            <div><Label>CPF</Label><Input value={form.cpf} onChange={e=>setForm({...form, cpf: e.target.value})} /></div>
            <div><Label>Nascimento</Label><Input type="date" value={form.birth_date} onChange={e=>setForm({...form, birth_date: e.target.value})} /></div>
            <div className="col-span-2"><Label>Plano</Label><Input value={form.plan_name} onChange={e=>setForm({...form, plan_name: e.target.value})} /></div>
            <div className="col-span-2"><Label>Contato de emergência</Label><Input value={form.emergency_contact} onChange={e=>setForm({...form, emergency_contact: e.target.value})} /></div>
            <div className="col-span-2"><Label>Notas médicas</Label><Input value={form.medical_notes} onChange={e=>setForm({...form, medical_notes: e.target.value})} /></div>
          </div>
          <Button type="submit" className="w-full bg-[#D97634] hover:bg-[#D97634]/90" disabled={create.isPending}>Salvar</Button>
        </form>
      </FormDialog>

      <Sheet open={!!detail} onOpenChange={o => !o && setDetail(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{detail?.name}</SheetTitle></SheetHeader>
          {detail && (
            <Tabs defaultValue="dados" className="mt-4">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="medico">Médico</TabsTrigger>
                <TabsTrigger value="plano">Plano</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
              <TabsContent value="dados" className="space-y-2 text-sm pt-3">
                <Row k="Email"   v={detail.email} />
                <Row k="Telefone" v={detail.phone} />
                <Row k="CPF"      v={detail.cpf} />
                <Row k="Nascimento" v={detail.birth_date ? fmtDate(detail.birth_date) : null} />
                <Row k="Emergência" v={detail.emergency_contact} />
              </TabsContent>
              <TabsContent value="medico" className="space-y-2 text-sm pt-3">
                <Row k="Observações médicas" v={detail.medical_notes ?? "Nenhuma"} />
              </TabsContent>
              <TabsContent value="plano" className="space-y-2 text-sm pt-3">
                <Row k="Plano"  v={detail.plan_name} />
                <Row k="Início" v={detail.plan_start ? fmtDate(detail.plan_start) : null} />
                <Row k="Vencimento" v={detail.plan_end ? fmtDate(detail.plan_end) : null} />
                <Row k="Pagamento" v={detail.payment_status} />
              </TabsContent>
              <TabsContent value="historico" className="text-sm pt-3 text-muted-foreground">
                Histórico de check-ins disponível em breve.
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between border-b border-border py-1.5"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v ?? "—"}</span></div>;
}
