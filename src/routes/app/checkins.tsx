import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScanLine } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/app/checkins")({ component: Checkins });

function Checkins() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select(); }
      else if (e.key === "F5") { e.preventDefault(); qc.invalidateQueries({ queryKey: ["checkins-recent", aid] }); qc.invalidateQueries({ queryKey: ["checkins-today", aid] }); toast.info("Lista atualizada"); }
      else if (e.key === "Escape") { setSearch(""); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [aid, qc]);

  const { data: students } = useQuery({
    queryKey: ["students-search", aid, search], enabled: !!aid && search.length >= 2,
    queryFn: async () => (await supabase.from("student").select("id,name,cpf").eq("academy_id", aid!).or(`name.ilike.%${search}%,cpf.ilike.%${search}%`).limit(8)).data ?? [],
  });

  const { data: recent } = useQuery({
    queryKey: ["checkins-recent", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("checkin").select("id,student_name,time,date").eq("academy_id", aid!).order("created_at", { ascending: false }).limit(15)).data ?? [],
  });

  const { data: todayCount } = useQuery({
    queryKey: ["checkins-today", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("checkin").select("id", { count: "exact", head: true }).eq("academy_id", aid!).eq("date", today)).count ?? 0,
  });

  const doCheckin = useMutation({
    mutationFn: async (s: { id: string; name: string }) => {
      const now = new Date();
      const { error } = await supabase.from("checkin").insert({
        academy_id: aid!, student_id: s.id, student_name: s.name,
        date: today, time: format(now, "HH:mm:ss"), source: "manual",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Check-in registrado!"); setSearch(""); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 space-y-4">
        <Card><CardContent className="p-8 text-center">
          <div className="text-sm font-medium text-muted-foreground">Check-ins hoje</div>
          <div className="text-7xl font-bold text-primary mt-2">{todayCount ?? 0}</div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <label className="text-sm font-medium">Buscar aluno (nome ou CPF) — <kbd className="px-1 py-0.5 bg-muted rounded">F2</kbd></label>
          <Input ref={inputRef} value={search} onChange={(e)=>setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && students && students[0]) {
                e.preventDefault();
                doCheckin.mutate({ id: students[0].id, name: students[0].name });
              }
            }}
            placeholder="Digite nome ou CPF e Enter…"
            className="h-14 text-lg mt-2" autoFocus />
          <div className="mt-2 text-xs text-muted-foreground flex gap-3 flex-wrap">
            <span><kbd className="px-1 py-0.5 bg-muted rounded">F2</kbd> focar busca</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> confirmar primeiro</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">ESC</kbd> limpar</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">F5</kbd> atualizar lista</span>
          </div>

          {students && students.length > 0 && (
            <div className="mt-3 space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between border border-border rounded p-3">
                  <div><div className="font-medium">{s.name}</div>{s.cpf && <div className="text-xs text-muted-foreground">{s.cpf}</div>}</div>
                  <Button size="lg" onClick={() => doCheckin.mutate({ id: s.id, name: s.name })} disabled={doCheckin.isPending}>
                    <ScanLine className="h-5 w-5" />Fazer check-in
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-5">
        <h3 className="font-semibold mb-3">Últimos check-ins</h3>
        <div className="space-y-2">
          {(recent ?? []).map(c => (
            <div key={c.id} className="flex justify-between text-sm border-b border-border pb-2">
              <span className="font-medium">{c.student_name}</span>
              <span className="text-muted-foreground">{c.time?.slice(0,5)}</span>
            </div>
          ))}
          {!recent?.length && <div className="text-sm text-muted-foreground">Nenhum check-in ainda</div>}
        </div>
      </CardContent></Card>
    </div>
  );
}