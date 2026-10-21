import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAcademiaWithOwner } from "@/lib/master-academy.functions";
import { sendWelcomeEmail } from "@/lib/email-client";
import { BUSINESS_TYPES, onlyDigits, maskCPF, maskCNPJ, isValidCPF, isValidCNPJ } from "@/lib/documento";
import { COBRANCAS, DDIS, PASSWORD_RULES, isStrongPassword, type Cobranca } from "@/lib/empresa";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2, MapPin, Phone, User, CreditCard, KeyRound, Copy, MessageCircle, AlertTriangle, ExternalLink,
  Plus, Trash2, CalendarIcon, Eye, EyeOff, Check, X, Send,
} from "lucide-react";

export const Route = createFileRoute("/master/novaempresa")({
  head: () => ({ meta: [{ title: "Nova Empresa — Gym Hub Master" }] }),
  component: Nova,
});

type Credentials = {
  academy_id: string;
  email_admin: string;
  senha_gerada: string;
  slug_publico: string;
  link_publico_completo: string;
};

type Valor = { valor: string; cobranca: Cobranca };

const initial = {
  nome: "", slug: "", cor_principal: "#F97316",
  tipo_empresa: "academia" as string, documento: "",
  telefone: "", whatsapp_ddi: "55", whatsapp: "", email: "",
  endereco: { cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "" },
  system_plan_id: "", valor_mensal: 0,
  email_admin: "", nome_admin: "", senha_admin: "",
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const parseBRL = (s: string) => Number(onlyDigits(s) || "0") / 100;
const maskBRL = (s: string) => brl(parseBRL(s));
const maskDoc = (v: string) => (onlyDigits(v).length > 11 ? maskCNPJ(v) : maskCPF(v));
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Nova() {
  const navigate = useNavigate();
  const create = useServerFn(createAcademiaWithOwner);
  const [f, setF] = useState(initial);
  const [valores, setValores] = useState<Valor[]>([{ valor: "", cobranca: "mensal" }]);
  const [venc, setVenc] = useState<Date | undefined>();
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState<Credentials | null>(null);
  const { data: plans } = useQuery({
    queryKey: ["system-plans-active"],
    queryFn: async () => (await supabase.from("system_plan").select("id, nome, valor, max_alunos_ativos").eq("ativo", true).order("valor")).data ?? [],
  });

  const update = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const updateEndereco = <K extends keyof typeof f.endereco>(k: K, v: string) =>
    setF((p) => ({ ...p, endereco: { ...p.endereco, [k]: v } }));
  const setValor = (i: number, patch: Partial<Valor>) =>
    setValores((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  const docDigits = onlyDigits(f.documento);
  const docInvalid = docDigits.length > 0 &&
    !((docDigits.length === 11 && isValidCPF(docDigits)) || (docDigits.length === 14 && isValidCNPJ(docDigits)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.system_plan_id) { toast.error("Selecione um plano"); return; }
    if (docInvalid) { toast.error("CPF/CNPJ inválido"); return; }
    if (!isStrongPassword(f.senha_admin)) { toast.error("A senha do admin não atende aos requisitos"); return; }
    setBusy(true);
    try {
      const result = await create({
        data: {
          ...f,
          valores: valores.filter((v) => v.valor && parseBRL(v.valor) > 0).map((v) => ({ valor: parseBRL(v.valor), cobranca: v.cobranca })),
          data_vencimento: venc ? format(venc, "yyyy-MM-dd") : "",
        },
      });
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

  const waDigits = onlyDigits(f.whatsapp);

  return (
    <div>
      <PageHeader title="NOVA EMPRESA" description="Cadastro completo + criação do admin de acesso da empresa." />
      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        <Section icon={<Building2 className="h-4 w-4" />} title="Dados da Empresa">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome*"><Input required value={f.nome} onChange={(e) => { const n = e.target.value; setF((p) => ({ ...p, nome: n, slug: p.slug && p.slug !== slugify(p.nome) ? p.slug : slugify(n) })); }} /></Field>
            <Field label="Slug público*" hint="minúsculo, sem acento, separado por traço — usado em /agendar/...">
              <Input required value={f.slug} onChange={(e) => update("slug", slugify(e.target.value))} onBlur={(e) => update("slug", slugify(e.target.value))} placeholder="forca-total" />
            </Field>
            <Field label="CNPJ/CPF" hint={docInvalid ? undefined : "Opcional"}>
              <Input value={f.documento} onChange={(e) => update("documento", maskDoc(e.target.value))} placeholder="00.000.000/0000-00 ou 000.000.000-00" className={docInvalid ? "border-destructive" : ""} />
              {docInvalid && <div className="text-[11px] text-destructive mt-1">CPF/CNPJ inválido</div>}
            </Field>
            <Field label="Cor principal">
              <div className="flex gap-2 items-center">
                <Input type="color" className="w-16 h-10 p-1" value={f.cor_principal} onChange={(e) => update("cor_principal", e.target.value)} />
                <Input value={f.cor_principal} onChange={(e) => update("cor_principal", e.target.value)} />
              </div>
            </Field>
            <Field label="Tipo de Empresa*" className="sm:col-span-2">
              <Select value={f.tipo_empresa} onValueChange={(v) => update("tipo_empresa", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Label className="text-xs">Valores</Label>
            <div className="text-[11px] text-muted-foreground mb-2">Valores cobrados aos seus alunos. Cada linha vira um plano de aluno da empresa.</div>
            <div className="space-y-2">
              {valores.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input className="max-w-[180px]" inputMode="numeric" placeholder="R$ 0,00" value={v.valor} onChange={(e) => setValor(i, { valor: maskBRL(e.target.value) })} />
                  <Select value={v.cobranca} onValueChange={(c) => setValor(i, { cobranca: c as Cobranca })}>
                    <SelectTrigger className="max-w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{COBRANCAS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {i === valores.length - 1 && (
                    <Button type="button" size="icon" variant="outline" aria-label="Adicionar valor" onClick={() => setValores((vs) => [...vs, { valor: "", cobranca: "mensal" }])}><Plus className="h-4 w-4" /></Button>
                  )}
                  {valores.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" aria-label="Remover valor" onClick={() => setValores((vs) => vs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={<MapPin className="h-4 w-4" />} title="Endereço">
          <div className="grid sm:grid-cols-6 gap-4">
            <Field label="CEP" className="sm:col-span-2"><Input value={f.endereco.cep} onChange={(e) => updateEndereco("cep", e.target.value)} /></Field>
            <Field label="Rua" className="sm:col-span-3"><Input value={f.endereco.rua} onChange={(e) => updateEndereco("rua", e.target.value)} /></Field>
            <Field label="Numero"><Input value={f.endereco.numero} onChange={(e) => updateEndereco("numero", e.target.value)} /></Field>
            <Field label="Bairro" className="sm:col-span-2"><Input value={f.endereco.bairro} onChange={(e) => updateEndereco("bairro", e.target.value)} /></Field>
            <Field label="Cidade" className="sm:col-span-3"><Input value={f.endereco.cidade} onChange={(e) => updateEndereco("cidade", e.target.value)} /></Field>
            <Field label="UF"><Input maxLength={2} value={f.endereco.uf} onChange={(e) => updateEndereco("uf", e.target.value.toUpperCase())} /></Field>
          </div>
        </Section>

        <Section icon={<Phone className="h-4 w-4" />} title="Contato">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Telefone"><Input value={f.telefone} onChange={(e) => update("telefone", e.target.value)} /></Field>
            <Field label="WhatsApp" hint="DDI + (DDD) + número">
              <div className="flex gap-2">
                <Select value={f.whatsapp_ddi} onValueChange={(v) => update("whatsapp_ddi", v)}>
                  <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{DDIS.map((d) => <SelectItem key={d.code} value={d.code}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input inputMode="tel" placeholder="(11) 99999-9999" value={f.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
              </div>
            </Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e) => update("email", e.target.value)} /></Field>
          </div>
        </Section>

        <Section icon={<CreditCard className="h-4 w-4" />} title="Plano da Empresa">
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
            <Field label="Valor mensal (R$)" hint="Preenchido pelo plano escolhido">
              <Input readOnly value={f.system_plan_id ? brl(f.valor_mensal) : ""} placeholder="Selecione um plano" />
            </Field>
            <Field label="Data de Vencimento">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !venc && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {venc ? format(venc, "dd/MM/yyyy") : "DD/MM/AAAA"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={venc} onSelect={setVenc} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </Field>
          </div>
        </Section>

        <Section icon={<User className="h-4 w-4" />} title="Dados de Acesso">
          <div className="text-xs text-muted-foreground mb-3">Este é o admin da empresa criada (não é Super Admin) — usado para o login da empresa.</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome do Admin*"><Input required value={f.nome_admin} onChange={(e) => update("nome_admin", e.target.value)} /></Field>
            <Field label="Email do Admin*">
              <Input required type="email" value={f.email_admin} onChange={(e) => update("email_admin", e.target.value)} />
            </Field>
            <Field label="Senha do Admin*" className="sm:col-span-2">
              <div className="flex gap-2 max-w-md">
                <Input required type={showPw ? "text" : "password"} autoComplete="new-password" value={f.senha_admin} onChange={(e) => update("senha_admin", e.target.value)} />
                <Button type="button" size="icon" variant="outline" aria-label={showPw ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPw((s) => !s)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <ul className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-1 text-[11px]">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(f.senha_admin);
                  return (
                    <li key={r.key} className={cn("flex items-center gap-1", ok ? "text-emerald-600" : "text-muted-foreground")}>
                      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{r.label}
                    </li>
                  );
                })}
              </ul>
            </Field>
          </div>
        </Section>

        <div className="flex gap-3">
          <Button type="submit" disabled={busy} size="lg">
            {busy ? "Criando…" : "Criar Empresa + Admin"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/master/listaempresa" })}>Cancelar</Button>
        </div>
      </form>

      <CredentialsModal
        creds={creds}
        nome_admin={f.nome_admin}
        nome_academia={f.nome}
        whatsapp={waDigits ? `${f.whatsapp_ddi}${waDigits}` : ""}
        onClose={() => { setCreds(null); navigate({ to: "/master/listaempresa" }); }}
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

/** whatsapp = full international digits (DDI + DDD + number). */
function CredentialsModal({ creds, nome_admin, nome_academia, whatsapp, onClose }: {
  creds: Credentials | null; nome_admin: string; nome_academia: string; whatsapp: string; onClose: () => void;
}) {
  if (!creds) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLink = `${origin}${creds.link_publico_completo}`;
  const loginLink = `${origin}/entrar`;
  const all = `Empresa: ${nome_academia}\nNome do Admin: ${nome_admin}\nEmail: ${creds.email_admin}\nSenha: ${creds.senha_gerada}\nLink público: ${fullLink}`;
  const waMsg = encodeURIComponent(
    `Olá ${nome_admin}! Sua empresa ${nome_academia} foi criada no Gym Hub.\n\n` +
    `*Dados de acesso*\nNome do Admin: ${nome_admin}\nEmail do Admin: ${creds.email_admin}\nSenha do Admin: ${creds.senha_gerada}\n\n` +
    `Entrar: ${loginLink}\nLink público de matrícula: ${fullLink}`
  );
  const waUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Credenciais da empresa</DialogTitle>
          <DialogDescription>Empresa criada com sucesso. Envie os dados de acesso ao admin.</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 flex gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> Guarde a senha agora — ela não é exibida novamente.
        </div>

        <div className="space-y-3">
          <Row label="Nome do Admin" value={nome_admin} />
          <Row label="Email" value={creds.email_admin} />
          <Row label="Senha" value={creds.senha_gerada} mono />
          <Row label="Link público" value={fullLink} action={
            <Button size="sm" variant="ghost" asChild><a href={fullLink} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>
          } />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(all); toast.success("Tudo copiado"); }}>
            <Copy className="h-4 w-4 mr-2" />Copiar tudo
          </Button>
          <Button asChild variant="secondary">
            <a href={waUrl} target="_blank" rel="noreferrer">
              {whatsapp ? <Send className="h-4 w-4 mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}ENVIAR ACESSO
            </a>
          </Button>
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
