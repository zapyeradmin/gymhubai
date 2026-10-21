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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { Plus, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/equipe")({ component: Equipe });

const ROLE_LABELS: Record<string, string> = { owner: "Dono", admin: "Admin", professor: "Professor", recepcao: "Recepção", personal: "Personal" };

function Equipe() {
  const { tenant } = useTenant(); const aid = tenant?.academyId; const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "professor" as const });
  const { data: rows } = useQuery({
    queryKey: ["team", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("team_member").select("*").eq("academy_id", aid!).order("name")).data ?? [],
  });
  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("team_member").insert({ ...form, academy_id: aid! }); if (error) throw error; },
    onSuccess: () => { toast.success("Membro adicionado"); setOpen(false); qc.invalidateQueries({ queryKey: ["team"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Equipe" description="Profissionais e colaboradores da academia." actions={
        <Button onClick={() => setOpen(true)} className="bg-[#D97634] hover:bg-[#D97634]/90"><Plus className="h-4 w-4" />Novo membro</Button>
      } />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map((m, i) => {
          // KPIs sinteticos
          const alunos = (i + 1) * 14;
          const ocupacao = 60 + ((i * 7) % 35);
          return (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14"><AvatarFallback className="bg-[#D97634]/10 text-[#D97634] font-semibold text-lg">{m.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                    <Badge variant="secondary" className="mt-1">{ROLE_LABELS[m.role] ?? m.role}</Badge>
                  </div>
                </div>
                {(m.role === "professor") && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                    <div><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Alunos</div><div className="text-xl font-bold">{alunos}</div></div>
                    <div><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Ocupação</div><div className="text-xl font-bold">{ocupacao}%</div></div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!rows?.length && <div className="col-span-full text-center text-muted-foreground py-12">Nenhum membro cadastrado</div>}
      </div>

      <FormDialog open={open} onOpenChange={setOpen} title="Novo membro">
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate();}} className="space-y-3">
          <div><Label>Nome *</Label><Input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required /></div>
          <div><Label>Função</Label>
            <select className="w-full border border-border rounded-md h-9 px-2" value={form.role} onChange={e=>setForm({...form, role: e.target.value as any})}>
              <option value="admin">Admin</option><option value="professor">Professor</option><option value="recepcao">Recepção</option><option value="personal">Personal</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-[#D97634] hover:bg-[#D97634]/90" disabled={create.isPending}>Salvar</Button>
        </form>
      </FormDialog>
    </div>
  );
}
