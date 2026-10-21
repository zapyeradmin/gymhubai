import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormDialog } from "@/components/form-dialog";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

export const Route = createFileRoute("/app/agenda")({ component: Agenda });

const DAYS = [
  { i: 1, label: "Segunda" }, { i: 2, label: "Terça" }, { i: 3, label: "Quarta" },
  { i: 4, label: "Quinta" }, { i: 5, label: "Sexta" }, { i: 6, label: "Sábado" },
];
const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i); // 6h-22h

const MODALITY_COLORS: Record<string, string> = {
  "Musculacao": "bg-[#D97634]/20 border-l-4 border-[#D97634] text-[#7a3e15]",
  "Funcional":  "bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900",
  "Pilates":    "bg-purple-100 border-l-4 border-purple-500 text-purple-900",
  "Yoga":       "bg-sky-100 border-l-4 border-sky-500 text-sky-900",
  "Crossfit":   "bg-rose-100 border-l-4 border-rose-500 text-rose-900",
  "Spinning":   "bg-amber-100 border-l-4 border-amber-500 text-amber-900",
  "Body Pump":  "bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900",
  "Zumba":      "bg-pink-100 border-l-4 border-pink-500 text-pink-900",
};

const MODALITIES = ["Musculacao", "Funcional", "Pilates", "Yoga", "Crossfit", "Aerobica", "Outro"] as const;
const NO_INSTRUCTOR = "__none__";
const emptyForm = {
  name: "",
  modality: "Musculacao",
  day_of_week: 1,
  start_time: "07:00",
  end_time: "08:00",
  instructor: NO_INSTRUCTOR,
  max_capacity: 20,
};

function Agenda() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const { data } = useQuery({
    queryKey: ["schedule", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("schedule").select("*").eq("academy_id", aid!).eq("active", true)).data ?? [],
  });

  const { data: instructors } = useQuery({
    queryKey: ["team_member-active", aid], enabled: !!aid,
    queryFn: async () => (await supabase.from("team_member").select("id,name").eq("academy_id", aid!).eq("active", true)).data ?? [],
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({
      name: a.name ?? "",
      modality: a.modality ?? "Musculacao",
      day_of_week: a.day_of_week ?? 1,
      start_time: (a.start_time ?? "07:00:00").slice(0, 5),
      end_time: (a.end_time ?? "08:00:00").slice(0, 5),
      instructor: a.instructor_id ?? NO_INSTRUCTOR,
      max_capacity: a.max_capacity ?? 20,
    });
    setSelected(null);
    setFormOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (form.end_time <= form.start_time) throw new Error("Hora fim deve ser maior que hora início.");
      const inst = instructors?.find((i: any) => i.id === form.instructor);
      const payload = {
        name: form.name,
        modality: form.modality as any,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        instructor_id: inst?.id ?? null,
        instructor_name: inst?.name ?? null,
        max_capacity: form.max_capacity,
      };
      if (editingId) {
        const { error } = await supabase.from("schedule").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedule").insert({ ...payload, active: true, academy_id: aid! });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Aula atualizada" : "Aula criada");
      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      qc.invalidateQueries({ queryKey: ["schedule", aid] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar aula"),
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule").update({ active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aula removida");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["schedule", aid] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao remover"),
  });

  const move = useMutation({
    mutationFn: async (vars: { id: string; day: number; hour: number; oldStart: string; oldEnd: string }) => {
      const [, mm, ss] = vars.oldStart.split(":");
      const oldH = parseInt(vars.oldStart.slice(0, 2));
      const oldEndH = parseInt(vars.oldEnd.slice(0, 2));
      const dur = oldEndH - oldH;
      const start = `${String(vars.hour).padStart(2, "0")}:${mm}:${ss ?? "00"}`;
      const end = `${String(vars.hour + dur).padStart(2, "0")}:${vars.oldEnd.slice(3)}`;
      const { error } = await supabase.from("schedule").update({ day_of_week: vars.day, start_time: start, end_time: end }).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aula reagendada"); qc.invalidateQueries({ queryKey: ["schedule", aid] }); },
    onError: (e: any) => toast.error(e.message ?? "Erro ao mover aula"),
  });

  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    const [d, h] = r.destination.droppableId.split(":").map(Number);
    const aula = (data ?? []).find((s: any) => s.id === r.draggableId);
    if (!aula) return;
    if (aula.day_of_week === d && parseInt(aula.start_time.slice(0, 2)) === h) return;
    move.mutate({ id: aula.id, day: d, hour: h, oldStart: aula.start_time, oldEnd: aula.end_time });
  };

  return (
    <div>
      <PageHeader title="Agenda" description="Arraste aulas entre horários e dias. Clique para detalhes." actions={
        <Button onClick={openCreate} className="bg-[#D97634] hover:bg-[#D97634]/90"><Plus className="h-4 w-4" />Nova aula</Button>
      } />

      <DragDropContext onDragEnd={onDragEnd}>
      <Card><CardContent className="p-3">
        <div className="grid grid-cols-[60px_repeat(6,minmax(0,1fr))] gap-1 min-w-[900px]">
          <div></div>
          {DAYS.map(d => <div key={d.i} className="text-center text-xs font-semibold py-2 text-muted-foreground uppercase">{d.label}</div>)}
          {HOURS.map(h => (
            <div key={`row-${h}`} className="contents">
              <div key={`h${h}`} className="text-xs text-muted-foreground text-right pr-2 py-3 border-t border-border">{h}h</div>
              {DAYS.map(d => {
                const aulas = (data ?? []).filter(s => s.day_of_week === d.i && parseInt(s.start_time.slice(0,2)) === h);
                return (
                  <Droppable droppableId={`${d.i}:${h}`} key={`${d.i}-${h}`}>
                    {(prov, snap) => (
                      <div ref={prov.innerRef} {...prov.droppableProps}
                        className={`border-t border-border min-h-[60px] p-1 space-y-1 transition ${snap.isDraggingOver ? "bg-primary/10" : ""}`}>
                        {aulas.map((a, idx) => {
                          const cls = MODALITY_COLORS[a.modality as string] ?? "bg-muted border-l-4 border-muted-foreground";
                          return (
                            <Draggable draggableId={a.id} index={idx} key={a.id}>
                              {(p, s) => (
                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                                  onClick={() => setSelected(a)}
                                  className={`text-left text-xs rounded p-1.5 cursor-grab active:cursor-grabbing ${cls} ${s.isDragging ? "shadow-lg scale-105" : "hover:opacity-80"} transition`}>
                                  <div className="font-semibold truncate">{a.name}</div>
                                  <div className="opacity-80">{a.start_time?.slice(0,5)}–{a.end_time?.slice(0,5)}</div>
                                  {a.instructor_name && <div className="text-[10px] opacity-70 truncate">{a.instructor_name}</div>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {prov.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent></Card>
      </DragDropContext>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Modalidade:</span> <strong>{selected.modality}</strong></div>
              <div><span className="text-muted-foreground">Horário:</span> {selected.start_time?.slice(0,5)} – {selected.end_time?.slice(0,5)}</div>
              <div><span className="text-muted-foreground">Professor:</span> {selected.instructor_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Capacidade:</span> {selected.max_capacity}</div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(selected)}>Editar</Button>
                <Button variant="destructive" className="flex-1" disabled={deactivate.isPending}
                  onClick={() => { if (confirm("Remover esta aula?")) deactivate.mutate(selected.id); }}>
                  Desativar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FormDialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) { setEditingId(null); setForm({ ...emptyForm }); } }} title={editingId ? "Editar aula" : "Nova aula"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div><Label>Nome da aula *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Modalidade *</Label>
              <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODALITIES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dia da semana *</Label>
              <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => <SelectItem key={d.i} value={String(d.i)}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Hora início *</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required /></div>
            <div><Label>Hora fim *</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required /></div>
          </div>
          <div>
            <Label>Professor</Label>
            <Select value={form.instructor} onValueChange={(v) => setForm({ ...form, instructor: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_INSTRUCTOR}>Sem professor</SelectItem>
                {(instructors ?? []).map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Capacidade *</Label><Input type="number" min={1} value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: Number(e.target.value) })} required /></div>
          <Button type="submit" className="w-full bg-[#D97634] hover:bg-[#D97634]/90" disabled={save.isPending}>Salvar</Button>
        </form>
      </FormDialog>
    </div>
  );
}
