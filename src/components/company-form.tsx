import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Building2, Phone, MapPin, User, Award, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BUSINESS_TYPES, defaultConselho, isValidCNPJ, isValidCPF, maskCNPJ, maskCPF, onlyDigits } from "@/lib/documento";

type RT = { id?: string; nome: string; conselho: "CREF" | "CREFITO"; numero_registro: string; uf: string; principal: boolean };

const empty = {
  tipo_empresa: "academia", name: "", razao_social: "", documento_tipo: "cnpj", documento: "",
  inscricao_estadual: "", inscricao_municipal: "", telefone: "", whatsapp: "", email: "", site: "", instagram: "",
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  owner_nome: "", owner_cpf: "", owner_email: "", owner_telefone: "",
  mon_fri: "", sat: "", sun: "", capacity_per_class: "30",
};
type F = typeof empty;

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome fantasia").max(120),
  email: z.string().trim().email("E-mail inválido").max(255).or(z.literal("")),
  owner_email: z.string().trim().email("E-mail do proprietário inválido").or(z.literal("")),
  uf: z.string().regex(/^([A-Za-z]{2})?$/, "UF deve ter 2 letras"),
  capacity_per_class: z.coerce.number().int().min(1, "Capacidade inválida").max(5000),
});

export function CompanyForm({ academyId, canEdit, onSaved }: { academyId: string; canEdit: boolean; onSaved?: () => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["company", academyId],
    queryFn: async () => {
      const [{ data: a, error }, { data: rts }] = await Promise.all([
        supabase.from("academy").select("*").eq("id", academyId).single(),
        supabase.from("academy_technical_responsible").select("*").eq("academy_id", academyId).order("created_at"),
      ]);
      if (error) throw error;
      return { a, rts: rts ?? [] };
    },
  });
  const [f, setF] = useState<F>(empty);
  const [rts, setRts] = useState<RT[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data?.a) return;
    const a: any = data.a; const e = a.endereco ?? {}; const h = a.business_hours ?? {};
    setF({
      tipo_empresa: a.tipo_empresa ?? "academia", name: a.name ?? "", razao_social: a.razao_social ?? "",
      documento_tipo: a.documento_tipo ?? "cnpj", documento: a.documento ?? a.cnpj ?? "",
      inscricao_estadual: a.inscricao_estadual ?? "", inscricao_municipal: a.inscricao_municipal ?? "",
      telefone: a.telefone ?? "", whatsapp: a.whatsapp ?? "", email: a.email ?? "", site: a.site ?? "", instagram: a.instagram ?? "",
      cep: e.cep ?? "", rua: e.rua ?? "", numero: e.numero ?? "", complemento: e.complemento ?? "", bairro: e.bairro ?? "", cidade: e.cidade ?? "", uf: e.uf ?? "",
      owner_nome: a.owner_nome ?? "", owner_cpf: a.owner_cpf ?? "", owner_email: a.owner_email ?? "", owner_telefone: a.owner_telefone ?? "",
      mon_fri: h.mon_fri ?? "", sat: h.sat ?? "", sun: h.sun ?? "", capacity_per_class: String(a.capacity_per_class ?? 30),
    });
    setRts(data.rts.map((r: any) => ({ id: r.id, nome: r.nome, conselho: r.conselho, numero_registro: r.numero_registro, uf: r.uf ?? "", principal: r.principal })));
    setRemoved([]);
  }, [data]);

  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const docMask = f.documento_tipo === "cpf" ? maskCPF : maskCNPJ;

  const buscarCep = async () => {
    const c = onlyDigits(f.cep);
    if (c.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`).then((x) => x.json());
      if (r.erro) return toast.error("CEP não encontrado");
      setF((p) => ({ ...p, rua: r.logradouro || p.rua, bairro: r.bairro || p.bairro, cidade: r.localidade || p.cidade, uf: r.uf || p.uf }));
    } catch { /* offline */ }
  };

  const save = async () => {
    const parsed = schema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (f.documento) {
      const ok = f.documento_tipo === "cpf" ? isValidCPF(f.documento) : isValidCNPJ(f.documento);
      if (!ok) return toast.error(f.documento_tipo === "cpf" ? "CPF inválido" : "CNPJ inválido");
    }
    if (f.owner_cpf && !isValidCPF(f.owner_cpf)) return toast.error("CPF do proprietário inválido");
    for (const r of rts) if (!r.nome.trim() || !r.numero_registro.trim()) return toast.error("Preencha nome e número de registro do responsável técnico");

    setSaving(true);
    const n = (v: string) => (v.trim() ? v.trim() : null);
    const { error } = await supabase.from("academy").update({
      tipo_empresa: f.tipo_empresa as any, name: f.name.trim(), razao_social: n(f.razao_social),
      documento_tipo: f.documento_tipo, documento: n(f.documento), cnpj: f.documento_tipo === "cnpj" ? n(f.documento) : null,
      inscricao_estadual: n(f.inscricao_estadual), inscricao_municipal: n(f.inscricao_municipal),
      telefone: n(f.telefone), whatsapp: n(f.whatsapp), email: n(f.email), site: n(f.site), instagram: n(f.instagram),
      endereco: { cep: f.cep, rua: f.rua, numero: f.numero, complemento: f.complemento, bairro: f.bairro, cidade: f.cidade, uf: f.uf.toUpperCase() },
      owner_nome: n(f.owner_nome), owner_cpf: n(f.owner_cpf), owner_email: n(f.owner_email.toLowerCase()), owner_telefone: n(f.owner_telefone),
      business_hours: { mon_fri: f.mon_fri, sat: f.sat, sun: f.sun }, capacity_per_class: parsed.data.capacity_per_class,
    }).eq("id", academyId);
    if (error) { setSaving(false); return toast.error(error.message); }

    if (removed.length) await supabase.from("academy_technical_responsible").delete().in("id", removed);
    for (const r of rts) {
      const row = { academy_id: academyId, nome: r.nome.trim(), conselho: r.conselho, numero_registro: r.numero_registro.trim(), uf: n(r.uf)?.toUpperCase() ?? null, principal: r.principal };
      const res = r.id
        ? await supabase.from("academy_technical_responsible").update(row).eq("id", r.id)
        : await supabase.from("academy_technical_responsible").insert(row);
      if (res.error) { setSaving(false); return toast.error(res.error.message); }
    }
    setSaving(false);
    toast.success("Dados da empresa salvos");
    qc.invalidateQueries({ queryKey: ["company", academyId] });
    onSaved?.();
  };

  const addRt = () => setRts((p) => [...p, { nome: "", conselho: defaultConselho(f.tipo_empresa) as RT["conselho"], numero_registro: "", uf: f.uf, principal: p.length === 0 }]);
  const updRt = (i: number, patch: Partial<RT>) => setRts((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : patch.principal ? { ...r, principal: false } : r)));
  const delRt = (i: number) => setRts((p) => { const r = p[i]; if (r.id) setRemoved((x) => [...x, r.id!]); return p.filter((_, j) => j !== i); });

  const Field = ({ label, k, ph, mask, className }: { label: string; k: keyof F; ph?: string; mask?: (v: string) => string; className?: string }) => (
    <div className={className}><Label>{label}</Label>
      <Input disabled={!canEdit} placeholder={ph} value={f[k]} onChange={(e) => setF((p) => ({ ...p, [k]: mask ? mask(e.target.value) : e.target.value }))} /></div>
  );
  const Section = ({ icon: Icon, title, children }: any) => (
    <Card><CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</div>{children}
    </CardContent></Card>
  );

  return (
    <fieldset disabled={!canEdit} className="space-y-4 max-w-4xl">
      <Section icon={Building2} title="Identificação da empresa">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Tipo de empresa</Label>
            <Select value={f.tipo_empresa} onValueChange={(v) => setF((p) => ({ ...p, tipo_empresa: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select></div>
          {Field({ label: "Nome fantasia *", k: "name" })}
          {Field({ label: "Razão social", k: "razao_social" })}
          <div className="md:col-span-2"><Label>Documento (opcional)</Label>
            <RadioGroup className="flex gap-6 my-2" value={f.documento_tipo} onValueChange={(v) => setF((p) => ({ ...p, documento_tipo: v, documento: "" }))}>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="cnpj" />CNPJ</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="cpf" />CPF do proprietário</label>
            </RadioGroup>
            <Input placeholder={f.documento_tipo === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} value={f.documento} onChange={(e) => setF((p) => ({ ...p, documento: docMask(e.target.value) }))} /></div>
          {Field({ label: "Inscrição estadual", k: "inscricao_estadual" })}
          {Field({ label: "Inscrição municipal", k: "inscricao_municipal" })}
        </div>
      </Section>

      <Section icon={Phone} title="Contato">
        <div className="grid gap-4 md:grid-cols-2">
          {Field({ label: "Telefone", k: "telefone", ph: "(11) 3333-4444" })}
          {Field({ label: "WhatsApp", k: "whatsapp", ph: "(11) 99999-0000" })}
          {Field({ label: "E-mail", k: "email" })}
          {Field({ label: "Site", k: "site", ph: "https://" })}
          {Field({ label: "Instagram", k: "instagram", ph: "@suaempresa" })}
        </div>
      </Section>

      <Section icon={MapPin} title="Endereço">
        <div className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-2"><Label>CEP</Label><Input value={f.cep} onChange={set("cep")} onBlur={buscarCep} placeholder="00000-000" /></div>
          {Field({ label: "Rua", k: "rua", className: "md:col-span-4" })}
          {Field({ label: "Número", k: "numero", className: "md:col-span-2" })}
          {Field({ label: "Complemento", k: "complemento", className: "md:col-span-4" })}
          {Field({ label: "Bairro", k: "bairro", className: "md:col-span-2" })}
          {Field({ label: "Cidade", k: "cidade", className: "md:col-span-3" })}
          {Field({ label: "UF", k: "uf", className: "md:col-span-1", mask: (v) => v.slice(0, 2).toUpperCase() })}
        </div>
      </Section>

      <Section icon={User} title="Proprietário">
        <div className="grid gap-4 md:grid-cols-2">
          {Field({ label: "Nome", k: "owner_nome" })}
          {Field({ label: "CPF", k: "owner_cpf", mask: maskCPF, ph: "000.000.000-00" })}
          {Field({ label: "E-mail", k: "owner_email" })}
          {Field({ label: "Telefone", k: "owner_telefone" })}
        </div>
      </Section>

      <Section icon={Award} title="Responsável técnico">
        {rts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum responsável técnico cadastrado.</p>}
        {rts.map((r, i) => (
          <div key={r.id ?? i} className="grid gap-3 md:grid-cols-12 items-end border rounded-md p-3">
            <div className="md:col-span-4"><Label>Nome</Label><Input value={r.nome} onChange={(e) => updRt(i, { nome: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Conselho</Label>
              <Select value={r.conselho} onValueChange={(v) => updRt(i, { conselho: v as RT["conselho"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="CREF">CREF</SelectItem><SelectItem value="CREFITO">CREFITO</SelectItem></SelectContent>
              </Select></div>
            <div className="md:col-span-3"><Label>Nº do {r.conselho}</Label><Input value={r.numero_registro} onChange={(e) => updRt(i, { numero_registro: e.target.value })} placeholder={r.conselho === "CREF" ? "000000-G/SP" : "000000-F"} /></div>
            <div className="md:col-span-1"><Label>UF</Label><Input value={r.uf} onChange={(e) => updRt(i, { uf: e.target.value.slice(0, 2).toUpperCase() })} /></div>
            <label className="md:col-span-1 flex items-center gap-1 text-xs pb-2"><input type="radio" checked={r.principal} onChange={() => updRt(i, { principal: true })} />Principal</label>
            <Button type="button" variant="ghost" size="icon" className="md:col-span-1" onClick={() => delRt(i)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRt}><Plus className="h-4 w-4 mr-1" />Adicionar responsável técnico</Button>
        {f.tipo_empresa === "estudio_pilates" && <p className="text-xs text-muted-foreground">Para estúdios de Pilates, o registro pode ser CREFITO.</p>}
      </Section>

      <Section icon={Clock} title="Funcionamento">
        <div className="grid gap-4 md:grid-cols-4">
          {Field({ label: "Seg–Sex", k: "mon_fri", ph: "06:00–22:00" })}
          {Field({ label: "Sábado", k: "sat", ph: "08:00–14:00" })}
          {Field({ label: "Domingo", k: "sun", ph: "Fechado" })}
          {Field({ label: "Capacidade por aula", k: "capacity_per_class" })}
        </div>
      </Section>

      {canEdit
        ? <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar dados da empresa"}</Button>
        : <p className="text-sm text-muted-foreground">Somente o proprietário ou administrador pode editar.</p>}
    </fieldset>
  );
}
