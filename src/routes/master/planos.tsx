import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL } from "@/lib/format";
import { PLAN_FEATURES, DURATIONS, type PlanDuration } from "@/lib/system-plans";

export const Route = createFileRoute("/master/planos")({
  head: () => ({ meta: [{ title: "Planos do sistema · GymBoss AI" }] }),
  component: MasterPlanos,
});

type Form = { id?: string; nome: string; descricao: string; max_alunos_ativos: number; valor: number; duracao: PlanDuration; permissoes: string[]; destaque: boolean };
const empty: Form = { nome: "", descricao: "", max_alunos_ativos: 100, valor: 0, duracao: "recorrencia", permissoes: PLAN_FEATURES.map((f) => f.key), destaque: false };

function MasterPlanos() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(empty);
  const { data: rows } = useQuery({
    queryKey: ["system-plans"],
    queryFn: async () => (await supabase.from("system_plan").select("*").order("valor")).data ?? [],
  });
  const { data: counts } = useQuery({
    queryKey: ["system-plan-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("academy").select("system_plan_id");
      const m: Record<string, number> = {};
      (data ?? []).forEach((a) => { if (a.system_plan_id) m[a.system_plan_id] = (m[a.system_plan_id] ?? 0) + 1; });
      return m;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...payload } = f;
      const perms = Array.from(new Set([...payload.permissoes, "dashboard", "configuracoes"]));
      const body = { ...payload, permissoes: perms, descricao: payload.descricao || null };
      const { error } = id
        ? await supabase.from("system_plan").update(body).eq("id", id)
        : await supabase.from("system_plan").insert(body);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Plano salvo"); setOpen(false); qc.invalidateQueries({ queryKey: ["system-plans"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (p: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("system_plan").update({ ativo: !p.ativo }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-plans"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePerm = (k: string, on: boolean) =>
    setF((p) => ({ ...p, permissoes: on ? [...p.permissoes, k] : p.permissoes.filter((x) => x !== k) }));

  return (
    <div>
      <PageHeader title="Planos" description="Planos que as empresas podem contratar." actions={
        <Button onClick={() => { setF(empty); setOpen(true); }}><Plus className="h-4 w-4" />Criar Plano</Button>
      } />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map((p) => (
          <Card key={p.id} className={`relative ${p.destaque ? "border-primary border-2" : ""} ${p.ativo ? "" : "opacity-60"}`}>
            {p.destaque && <Badge className="absolute -top-2 right-4"><Star className="h-3 w-3 mr-1" />Destaque</Badge>}
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{p.nome}</h3>
                {!p.ativo && <Badge variant="outline">Inativo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground min-h-[2rem]">{p.descricao ?? ""}</p>
              <div className="text-3xl font-bold">{fmtBRL(p.valor)} <span className="text-sm font-normal text-muted-foreground">/ {DURATIONS.find((d) => d.value === p.duracao)?.label}</span></div>
              <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Até {p.max_alunos_ativos} alunos ativos</div>
              <div className="flex flex-wrap gap-1">
                {PLAN_FEATURES.filter((x) => p.permissoes.includes(x.key)).map((x) => (
                  <Badge key={x.key} variant="secondary" className="text-[10px]"><Check className="h-3 w-3 mr-0.5" />{x.label}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">{counts?.[p.id] ?? 0} empresa(s) neste plano</div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setF({ id: p.id, nome: p.nome, descricao: p.descricao ?? "", max_alunos_ativos: p.max_alunos_ativos, valor: Number(p.valor), duracao: p.duracao, permissoes: p.permissoes, destaque: p.destaque }); setOpen(true); }}>Editar</Button>
                <Button variant="ghost" onClick={() => toggleAtivo.mutate({ id: p.id, ativo: p.ativo })}>{p.ativo ? "Desativar" : "Ativar"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows?.length && <div className="col-span-full text-center text-muted-foreground py-12">Nenhum plano criado ainda.</div>}
      </div>

      <FormDialog open={open} onOpenChange={setOpen} title={f.id ? "Editar Plano" : "Novo Plano"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Nome do Plano *</Label><Input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></div>
          <div><Label>Descrição do Plano</Label><Textarea value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantidade de Alunos (Ativos) *</Label><Input type="number" min={0} required value={f.max_alunos_ativos} onChange={(e) => setF({ ...f, max_alunos_ativos: Number(e.target.value) })} /></div>
            <div><Label>Valor do Plano (R$) *</Label><Input type="number" min={0} step="0.01" required value={f.valor} onChange={(e) => setF({ ...f, valor: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Tipo de Duração *</Label>
            <Select value={f.duracao} onValueChange={(v: PlanDuration) => setF({ ...f, duracao: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Permissões do Plano</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PLAN_FEATURES.map((x) => {
                const locked = "locked" in x && x.locked;
                return (
                  <label key={x.key} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={locked || f.permissoes.includes(x.key)} disabled={locked} onCheckedChange={(v) => togglePerm(x.key, !!v)} />
                    {x.label}
                  </label>
                );
              })}
            </div>
          </div>
          <div><Label>Plano Destaque</Label>
            <RadioGroup className="flex gap-6 mt-2" value={f.destaque ? "sim" : "nao"} onValueChange={(v) => setF({ ...f, destaque: v === "sim" })}>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="sim" />Sim</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="nao" />Não</label>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={save.isPending}>Salvar Plano</Button>
        </form>
      </FormDialog>
    </div>
  );
}
