import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { Plus, Check, Star } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/app/planos")({ component: Planos });

function Planos() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, duration_months: 1, description: "", featured: false });
  const { data: rows } = useQuery({
    queryKey: ["plans", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("plan").select("*").eq("academy_id", aid!).order("price")).data ?? [],
  });
  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("plan").insert({ ...form, academy_id: aid! }); if (error) throw error; },
    onSuccess: () => { toast.success("Plano criado"); setOpen(false); setForm({ name: "", price: 0, duration_months: 1, description: "", featured: false }); qc.invalidateQueries({ queryKey: ["plans"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Planos" description={`${rows?.length ?? 0} plano(s) cadastrado(s)`} actions={
        <Button onClick={() => setOpen(true)} className="bg-[#D97634] hover:bg-[#D97634]/90"><Plus className="h-4 w-4" />Novo plano</Button>
      } />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map(p => (
          <Card key={p.id} className={p.featured ? "border-[#D97634] border-2 relative" : ""}>
            {p.featured && <Badge className="absolute -top-2 right-4 bg-[#D97634] hover:bg-[#D97634]"><Star className="h-3 w-3 mr-1" />Destaque</Badge>}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{p.description ?? ""}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#D97634]">{fmtBRL(p.price).replace("R$", "")}</span>
                <span className="text-sm text-muted-foreground">/ {p.duration_months}m</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{p.duration_months} {p.duration_months === 1 ? "mês" : "meses"} de acesso</div>
                {p.included_classes?.map((c: string) => <div key={c} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{c}</div>)}
                {p.total_checkins && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{p.total_checkins} check-ins</div>}
              </div>
              <Button variant="outline" className="w-full mt-5">Editar</Button>
            </CardContent>
          </Card>
        ))}
        {!rows?.length && <div className="col-span-full text-center text-muted-foreground py-12">Nenhum plano cadastrado. Crie o primeiro!</div>}
      </div>

      <FormDialog open={open} onOpenChange={setOpen} title="Novo plano">
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate();}} className="space-y-3">
          <div><Label>Nome *</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required /></div>
          <div><Label>Descrição</Label><Input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} required /></div>
            <div><Label>Duração (meses)</Label><Input type="number" value={form.duration_months} onChange={(e)=>setForm({...form, duration_months: Number(e.target.value)})} required /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form, featured: e.target.checked})} />Destaque</label>
          <Button type="submit" className="w-full bg-[#D97634] hover:bg-[#D97634]/90" disabled={create.isPending}>Salvar</Button>
        </form>
      </FormDialog>
    </div>
  );
}
