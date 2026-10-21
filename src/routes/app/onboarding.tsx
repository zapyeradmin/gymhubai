import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTenant } from "@/lib/tenant-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/app/onboarding")({ component: Onboarding });

const STEPS = ["Dados","Branding","Equipe","Planos & Aulas","Finalizar"];

function Onboarding() {
  const { user } = useAuth();
  const { refetch } = useTenant();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({
    name: "", telefone: "", email: user?.email ?? "",
    cor_primaria: "#D97634",
    equipe: "",
    planos: [
      { name: "Mensal", price: 89, duration_months: 1 },
      { name: "Trimestral", price: 249, duration_months: 3 },
      { name: "Anual", price: 899, duration_months: 12 },
    ],
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finalize = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data: acRaw, error: aErr } = await supabase.rpc("create_academy_with_owner", {
        p_name: data.name,
        p_telefone: data.telefone,
        p_email: data.email,
        p_cor_primaria: data.cor_primaria,
      }).single();
      if (aErr || !acRaw) throw aErr ?? new Error("Falha ao criar academia");
      const ac = acRaw as { id: string };

      if (data.planos.length) {
        await supabase.from("plan").insert(data.planos.map(p => ({ ...p, academy_id: ac.id })));
      }

      const emails = data.equipe.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
      if (emails.length) {
        await supabase.from("academy_user").insert(emails.map(e => ({
          academy_id: ac.id, email: e, role: "recepcao" as const, ativo: true,
        })));
      }

      toast.success("Academia criada!");
      await refetch();
      navigate({ to: "/app/dashboard", replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao criar academia");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Bem-vindo ao GymBoss AI</h1>
      <p className="text-muted-foreground">Vamos configurar sua academia em poucos passos.</p>

      <div className="flex items-center gap-2 my-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-1 flex-1 ${i < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card><CardContent className="p-6 space-y-4">
        {step === 0 && (<>
          <div><Label>Nome da academia *</Label><Input value={data.name} onChange={(e)=>setData({...data, name: e.target.value})} required /></div>
          <div><Label>Telefone</Label><Input value={data.telefone} onChange={(e)=>setData({...data, telefone: e.target.value})} /></div>
          <div><Label>Email de contato</Label><Input type="email" value={data.email} onChange={(e)=>setData({...data, email: e.target.value})} /></div>
        </>)}
        {step === 1 && (<>
          <div><Label>Cor primária</Label>
            <div className="flex gap-2 items-center">
              <Input type="color" value={data.cor_primaria} onChange={(e)=>setData({...data, cor_primaria: e.target.value})} className="w-20 h-10" />
              <Input value={data.cor_primaria} onChange={(e)=>setData({...data, cor_primaria: e.target.value})} />
            </div>
          </div>
        </>)}
        {step === 2 && (<>
          <div>
            <Label>Emails da equipe (um por linha)</Label>
            <textarea value={data.equipe} onChange={(e)=>setData({...data, equipe: e.target.value})}
              className="w-full border border-border rounded-md p-2 h-32 text-sm" placeholder="recepcao@academia.com" />
          </div>
        </>)}
        {step === 3 && (<>
          <Label>Planos iniciais</Label>
          {data.planos.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Input value={p.name} onChange={(e)=>{const c=[...data.planos]; c[i].name=e.target.value; setData({...data, planos: c});}} />
              <Input type="number" value={p.price} onChange={(e)=>{const c=[...data.planos]; c[i].price=Number(e.target.value); setData({...data, planos: c});}} />
              <Input type="number" value={p.duration_months} onChange={(e)=>{const c=[...data.planos]; c[i].duration_months=Number(e.target.value); setData({...data, planos: c});}} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Grade de aulas e modalidades pode ser configurada depois em /app/agenda.</p>
        </>)}
        {step === 4 && (<>
          <div className="text-center py-6">
            <h2 className="text-xl font-bold">Tudo pronto!</h2>
            <p className="text-muted-foreground mt-2">Você terá 14 dias de trial gratuito.</p>
          </div>
        </>)}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={back} disabled={step === 0 || busy}>Voltar</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={step === 0 && !data.name}>Continuar</Button>
          ) : (
            <Button onClick={finalize} disabled={busy}>Criar academia</Button>
          )}
        </div>
      </CardContent></Card>
    </div>
  );
}