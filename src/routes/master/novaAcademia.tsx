import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAcademiaWithOwner } from "@/lib/master-academy.functions";
import { sendWelcomeEmail } from "@/lib/email-client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, MapPin, Phone, User, CreditCard, KeyRound, Copy, MessageCircle, AlertTriangle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/master/novaAcademia")({ component: Nova });

type Credentials = {
  academy_id: string;
  email_admin: string;
  senha_gerada: string;
  slug_publico: string;
  link_publico_completo: string;
};

const initial = {
  nome: "", slug: "", cor_principal: "#F97316",
  telefone: "", whatsapp: "", email: "", cnpj: "",
  endereco: { cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "" },
  capacidade_max: 200, mensalidade_basica: 89,
  system_plan_id: "",
  valor_mensal: 197, dia_vencimento: 10,
  email_admin: "", nome_admin: "",
};

function Nova() {
  const navigate = useNavigate();
  const create = useServerFn(createAcademiaWithOwner);
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState<Credentials | null>(null);
  const { data: plans } = useQuery({
    queryKey: ["system-plans-active"],
    queryFn: async () => (await supabase.from("system_plan").select("id, nome, valor, max_alunos_ativos").eq("ativo", true).order("valor")).data ?? [],
  });

  const update = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const updateEndereco = <K extends keyof typeof f.endereco>(k: K, v: string) =>
    setF((p) => ({ ...p, endereco: { ...p.endereco, [k]: v } }));

  const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.system_plan_id) { toast.error("Selecione um plano"); return; }
    setBusy(true);
    try {
      const result = await create({ data: f });
      setCreds(result);
      await sendWelcomeEmail(f.email_admin, {
        nome_admin: f.nome_admin, nome_academia: f.nome,
        senha: result.senha_gerada, link_publico: result.link_publico_completo,
      });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Nova academia" description="Cadastro completo + criacao do admin de acesso." />
      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        <Section icon={<Building2 className="h-4 w-4" />} title="Dados da academia">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome*"><Input required value={f.nome} onChange={(e)=>{ update("nome", e.target.value); if(!f.slug) update("slug", slugify(e.target.value)); }} /></Field>
            <Field label="Slug publico*" hint="usado em /agendar/...">
              <Input required value={f.slug} onChange={(e)=>update("slug", slugify(e.target.value))} placeholder="forca-total" />
            </Field>
            <Field label="CNPJ"><Input value={f.cnpj} onChange={(e)=>update("cnpj", e.target.value)} /></Field>
            <Field label="Cor principal">
              <div className="flex gap-2 items-center">
                <Input type="color" className="w-16 h-10 p-1" value={f.cor_principal} onChange={(e)=>update("cor_principal", e.target.value)} />
                <Input value={f.cor_principal} onChange={(e)=>update("cor_principal", e.target.value)} />
              </div>
            </Field>
            <Field label="Capacidade max"><Input type="number" value={f.capacidade_max} onChange={(e)=>update("capacidade_max", Number(e.target.value))} /></Field>
            <Field label="Mensalidade basica (R$)"><Input type="number" value={f.mensalidade_basica} onChange={(e)=>update("mensalidade_basica", Number(e.target.value))} /></Field>
          </div>
        </Section>

        <Section icon={<MapPin className="h-4 w-4" />} title="Endereco">
          <div className="grid sm:grid-cols-6 gap-4">
            <Field label="CEP" className="sm:col-span-2"><Input value={f.endereco.cep} onChange={(e)=>updateEndereco("cep", e.target.value)} /></Field>
            <Field label="Rua" className="sm:col-span-3"><Input value={f.endereco.rua} onChange={(e)=>updateEndereco("rua", e.target.value)} /></Field>
            <Field label="Numero"><Input value={f.endereco.numero} onChange={(e)=>updateEndereco("numero", e.target.value)} /></Field>
            <Field label="Bairro" className="sm:col-span-2"><Input value={f.endereco.bairro} onChange={(e)=>updateEndereco("bairro", e.target.value)} /></Field>
            <Field label="Cidade" className="sm:col-span-3"><Input value={f.endereco.cidade} onChange={(e)=>updateEndereco("cidade", e.target.value)} /></Field>
            <Field label="UF"><Input maxLength={2} value={f.endereco.uf} onChange={(e)=>updateEndereco("uf", e.target.value.toUpperCase())} /></Field>
          </div>
        </Section>

        <Section icon={<Phone className="h-4 w-4" />} title="Contato">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Telefone"><Input value={f.telefone} onChange={(e)=>update("telefone", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={f.whatsapp} onChange={(e)=>update("whatsapp", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e)=>update("email", e.target.value)} /></Field>
          </div>
        </Section>

        <Section icon={<CreditCard className="h-4 w-4" />} title="Plano e cobranca">
          {plans && plans.length === 0 && (
            <div className="mb-3 text-sm text-amber-700">Nenhum plano ativo. <Link to="/master/planos" className="underline font-medium">Criar Plano</Link></div>
          )}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Plano*">
              <Select value={f.system_plan_id} onValueChange={(v) => { const p = plans?.find((x) => x.id === v); setF((s) => ({ ...s, system_plan_id: v, valor_mensal: p ? Number(p.valor) : s.valor_mensal })); }}>
                <SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger>
                <SelectContent>
                  {(plans ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.nome} — {p.max_alunos_ativos} alunos</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor mensal (R$)"><Input type="number" value={f.valor_mensal} onChange={(e)=>update("valor_mensal", Number(e.target.value))} /></Field>
            <Field label="Dia de vencimento"><Input type="number" min={1} max={28} value={f.dia_vencimento} onChange={(e)=>update("dia_vencimento", Number(e.target.value))} /></Field>
          </div>
        </Section>

        <Section icon={<User className="h-4 w-4" />} title="Admin de acesso">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome do admin*"><Input required value={f.nome_admin} onChange={(e)=>update("nome_admin", e.target.value)} /></Field>
            <Field label="Email do admin*" hint="Sera criado o login com senha gerada">
              <Input required type="email" value={f.email_admin} onChange={(e)=>update("email_admin", e.target.value)} />
            </Field>
          </div>
        </Section>

        <div className="flex gap-3">
          <Button type="submit" disabled={busy} size="lg" className="bg-orange-500 hover:bg-orange-600">
            {busy ? "Criando…" : "Criar academia + admin"}
          </Button>
          <Button type="button" variant="outline" onClick={()=>navigate({ to: "/master/listaAcademias" })}>Cancelar</Button>
        </div>
      </form>

      <CredentialsModal
        creds={creds}
        nome_admin={f.nome_admin}
        nome_academia={f.nome}
        whatsapp={f.whatsapp || f.telefone}
        onClose={() => { setCreds(null); navigate({ to: "/master/listaAcademias" }); }}
      />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">{icon}{title}</div>
        {children}
      </CardContent>
    </Card>
  );
}
function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export function CredentialsModal({ creds, nome_admin, nome_academia, whatsapp, onClose }: {
  creds: Credentials | null; nome_admin: string; nome_academia: string; whatsapp: string; onClose: () => void;
}) {
  if (!creds) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLink = `${origin}${creds.link_publico_completo}`;
  const all = `Academia: ${nome_academia}\nEmail: ${creds.email_admin}\nSenha: ${creds.senha_gerada}\nLink publico: ${fullLink}`;
  const wa = whatsapp.replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    `Ola ${nome_admin}! Sua academia ${nome_academia} foi criada no GymBoss AI.\n\n` +
    `Acesso:\nEmail: ${creds.email_admin}\nSenha: ${creds.senha_gerada}\n\nLink publico de matricula:\n${fullLink}\n\nAcesse e troque sua senha no primeiro login.`
  );

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-orange-500" />Credenciais geradas</DialogTitle>
          <DialogDescription>Academia criada com sucesso. Compartilhe os dados de acesso com o admin.</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 p-3 flex gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> Esta senha so aparece uma vez. Salve agora.
        </div>

        <div className="space-y-3">
          <Row label="Email" value={creds.email_admin} />
          <Row label="Senha" value={creds.senha_gerada} mono />
          <Row label="Link publico" value={fullLink} action={
            <Button size="sm" variant="ghost" asChild><a href={fullLink} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>
          } />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(all); toast.success("Tudo copiado"); }}>
            <Copy className="h-4 w-4 mr-2" />Copiar tudo
          </Button>
          {wa && (
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <a href={`https://wa.me/55${wa}?text=${waMsg}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />Enviar por WhatsApp
              </a>
            </Button>
          )}
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, mono, action }: { label: string; value: string; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-md p-3">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
        <div className={(mono ? "font-mono text-base " : "text-sm ") + "truncate"}>{value}</div>
      </div>
      {action}
      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copiado"); }}>
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}