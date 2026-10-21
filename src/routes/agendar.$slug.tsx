import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Dumbbell, Calendar, CheckCircle2, Sparkles, Check, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const Route = createFileRoute("/agendar/$slug")({
  loader: async ({ params }) => {
    const { data: academy } = await supabase
      .from("academy")
      .select("id,name,slug,cor_primaria,telefone,endereco")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!academy) throw notFound();
    const [{ data: plans }, { data: schedule }] = await Promise.all([
      supabase.from("plan").select("id,name,description,price,featured").eq("academy_id", academy.id).eq("active", true).order("price"),
      supabase.from("schedule").select("id,name,modality,instructor_name,day_of_week,start_time,end_time").eq("academy_id", academy.id).eq("active", true).order("day_of_week").order("start_time"),
    ]);
    return { academy, plans: plans ?? [], schedule: schedule ?? [] };
  },
  component: BookingPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#151310] text-white p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Academia não encontrada</h1>
        <p className="text-white/60">Verifique o link e tente novamente.</p>
      </div>
    </div>
  ),
});

function BookingPage() {
  const { academy, plans, schedule } = Route.useLoaderData();
  const brand = academy.cor_primaria ?? "#D97634";
  const [done, setDone] = useState<null | { kind: "trial" | "experimental" | "plan"; label?: string }>(null);

  if (done) {
    const waPhone = (academy.telefone ?? "").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá! Acabei de me inscrever em "${done.label ?? done.kind}" pelo site da ${academy.name}. Pode confirmar?`
    );
    return (
      <div className="min-h-screen bg-[#151310] text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white text-foreground">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cadastro recebido!</h2>
            <p className="text-muted-foreground mb-4">
              {academy.name} vai te chamar no WhatsApp para confirmar. Para acelerar, fale agora com a recepção:
            </p>
            {waPhone && (
              <Button asChild className="w-full h-12 mb-2" style={{ background: brand }}>
                <a href={`https://wa.me/55${waPhone}?text=${msg}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> Falar no WhatsApp
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => setDone(null)}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151310] text-white">
      <header className="border-b border-white/10 p-6 flex items-center gap-3 max-w-4xl mx-auto">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: brand }}>
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg">{academy.name}</div>
          <div className="text-xs text-white/60">Matrícula online · Aula experimental grátis</div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="experimental" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 h-auto p-1">
            <TabsTrigger value="experimental" className="data-[state=active]:bg-white data-[state=active]:text-foreground py-2">Aula experimental</TabsTrigger>
            <TabsTrigger value="trial" className="data-[state=active]:bg-white data-[state=active]:text-foreground py-2">Trial 7 dias</TabsTrigger>
            <TabsTrigger value="planos" className="data-[state=active]:bg-white data-[state=active]:text-foreground py-2">Ver planos</TabsTrigger>
          </TabsList>

          <TabsContent value="experimental" className="mt-6">
            <ExperimentalForm schedule={schedule} brand={brand} onDone={(label) => setDone({ kind: "experimental", label })} />
          </TabsContent>
          <TabsContent value="trial" className="mt-6">
            <TrialForm brand={brand} onDone={() => setDone({ kind: "trial", label: "Trial 7 dias" })} />
          </TabsContent>
          <TabsContent value="planos" className="mt-6">
            <PlansGrid plans={plans} brand={brand} onPick={(name) => setDone({ kind: "plan", label: name })} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

type ScheduleItem = { id: string; name: string; modality: string | null; instructor_name: string | null; day_of_week: number; start_time: string; end_time: string };

function ExperimentalForm({ schedule, brand, onDone }: { schedule: ScheduleItem[]; brand: string; onDone: (label: string) => void }) {
  // academy_id is needed for insert
  const academy_id = (Route.useLoaderData() as any).academy.id as string;
  const modalities = Array.from(new Set(schedule.map(s => s.modality).filter(Boolean))) as string[];
  const [modality, setModality] = useState<string>("");
  const [slotId, setSlotId] = useState<string>("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", age: "", goal: "" });
  const [loading, setLoading] = useState(false);
  const filtered = schedule.filter(s => s.modality === modality);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modality || !slotId) return toast.error("Escolha modalidade e horário");
    if (!form.name || !form.phone || !form.goal) return toast.error("Preencha nome, WhatsApp e objetivo");
    setLoading(true);
    const { error } = await supabase.from("lead").insert({
      academy_id, type: "aula_experimental",
      name: form.name, phone: form.phone, email: form.email || null,
      modality, schedule_id: slotId, objetivo: form.goal,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const slot = filtered.find(s => s.id === slotId);
    onDone(`${modality} · ${slot ? DAYS[slot.day_of_week] + " " + slot.start_time.slice(0,5) : ""}`);
  };

  return (
    <Card className="bg-white text-foreground">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: brand }} /> Aula experimental grátis</h2>
          <p className="text-sm text-muted-foreground">Escolha a modalidade e o horário. Sem compromisso.</p>
        </div>

        <div>
          <Label className="mb-2 block">1. Modalidade</Label>
          <div className="flex flex-wrap gap-2">
            {modalities.map(m => (
              <button key={m} type="button" onClick={() => { setModality(m); setSlotId(""); }}
                className="px-4 py-2 rounded-full border text-sm transition"
                style={modality === m ? { background: brand, color: "white", borderColor: brand } : {}}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {modality && (
          <div>
            <Label className="mb-2 block">2. Dia e horário</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filtered.map(s => (
                <button key={s.id} type="button" onClick={() => setSlotId(s.id)}
                  className="text-left p-3 rounded-lg border text-sm transition"
                  style={slotId === s.id ? { background: brand, color: "white", borderColor: brand } : {}}>
                  <div className="font-semibold">{DAYS[s.day_of_week]} · {s.start_time.slice(0,5)}</div>
                  <div className="text-xs opacity-80">{s.instructor_name}</div>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Sem horários cadastrados.</p>}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3 pt-2 border-t">
          <Label className="mb-2 block">3. Seus dados</Label>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
            <div><Label className="text-xs">WhatsApp *</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
            <div><Label className="text-xs">E-mail</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
            <div><Label className="text-xs">Idade</Label><Input type="number" min={12} max={99} value={form.age} onChange={e=>setForm({...form,age:e.target.value})} /></div>
          </div>
          <div>
            <Label className="text-xs mb-2 block">Objetivo *</Label>
            <RadioGroup value={form.goal} onValueChange={(v)=>setForm({...form,goal:v})} className="grid grid-cols-3 gap-2">
              {["Emagrecimento","Hipertrofia","Saúde"].map(g => (
                <label key={g} className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer text-sm">
                  <RadioGroupItem value={g} /> {g}
                </label>
              ))}
            </RadioGroup>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base" style={{ background: brand }}>
            {loading ? "Enviando…" : "Agendar aula experimental"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TrialForm({ brand, onDone }: { brand: string; onDone: () => void }) {
  const academy_id = (Route.useLoaderData() as any).academy.id as string;
  const [form, setForm] = useState({ name: "", phone: "", email: "", age: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return toast.error("Preencha todos os campos obrigatórios");
    setLoading(true);
    const { error } = await supabase.from("lead").insert({
      academy_id, type: "trial_7dias",
      name: form.name, phone: form.phone, email: form.email,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    onDone();
  };
  return (
    <Card className="bg-white text-foreground">
      <CardContent className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" style={{ color: brand }}/> Trial 7 dias grátis</h2>
          <p className="text-sm text-muted-foreground">Acesso completo por 7 dias. Sem cartão, sem fidelidade.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Nome completo *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>WhatsApp *</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
            <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          </div>
          <div><Label>Idade</Label><Input type="number" min={12} max={99} value={form.age} onChange={e=>setForm({...form,age:e.target.value})} /></div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base" style={{ background: brand }}>
            {loading ? "Criando…" : "Começar trial 7 dias"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PlansGrid({ plans, brand, onPick }: { plans: Array<{ id: string; name: string; description: string | null; price: number; featured: boolean }>; brand: string; onPick: (name: string) => void }) {
  const academy_id = (Route.useLoaderData() as any).academy.id as string;
  const [pick, setPick] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return;
    if (!form.name || !form.phone) return toast.error("Nome e WhatsApp sao obrigatorios");
    setLoading(true);
    const { error } = await supabase.from("lead").insert({
      academy_id, type: "interesse_plano",
      name: form.name, phone: form.phone, plan_id: pick.id,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const picked = pick.name;
    setPick(null); setForm({ name: "", phone: "" });
    onPick(picked);
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {plans.map(p => (
        <Card key={p.id} className={`bg-white text-foreground ${p.featured ? "ring-2" : ""}`} style={p.featured ? { boxShadow: `0 0 0 2px ${brand}` } : {}}>
          <CardContent className="p-6 flex flex-col h-full">
            {p.featured && <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: brand }}>Mais popular</div>}
            <div className="text-lg font-bold">{p.name}</div>
            <div className="mt-2 text-3xl font-bold">
              {p.price === 0 ? "Grátis" : <>R${p.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></>}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex-1">{p.description}</p>
            <Button className="w-full mt-4" style={{ background: brand }} onClick={() => setPick({ id: p.id, name: p.name })}>
              <Check className="h-4 w-4 mr-1" /> Começar agora
            </Button>
          </CardContent>
        </Card>
      ))}
      {plans.length === 0 && <p className="text-white/70 col-span-full text-center">Nenhum plano cadastrado.</p>}

      <Dialog open={!!pick} onOpenChange={(o) => { if(!o) setPick(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Plano {pick?.name}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Seu nome *</Label><Input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
            <div><Label>WhatsApp *</Label><Input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} required /></div>
            <Button type="submit" disabled={loading} className="w-full" style={{ background: brand }}>
              {loading ? "Enviando…" : "Quero este plano"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}