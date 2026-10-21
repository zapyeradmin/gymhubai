import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateAcademia, setAcademiaStatus, alterarSenhaAdmin, excluirAcademia } from "@/lib/master-academy.functions";
import { EMPRESAS_PAGE_SIZE, pageRange, totalPages, normalizeSearch, isActiveStatus, splitWhatsapp } from "@/lib/empresa-list";
import { BUSINESS_TYPES, maskCPF, maskCNPJ, onlyDigits, isValidCPF, isValidCNPJ } from "@/lib/documento";
import { DDIS, PASSWORD_RULES, isStrongPassword } from "@/lib/empresa";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, KeyRound, Eye, Pause, Play, Copy, Pencil, MessageCircle, Trash2, Search, X, EyeOff, Check } from "lucide-react";
import { fmtBRL } from "@/lib/format";
import { format } from "date-fns";
import { toast } from "sonner";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "todas").default("todas"),
  tipo: fallback(z.string(), "todos").default("todos"),
  plano: fallback(z.string(), "todos").default("todos"),
  page: fallback(z.number().int(), 1).default(1),
});

export const Route = createFileRoute("/master/listaempresa")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Empresas — GymBoss AI Master" }, { name: "description", content: "Gerencie todas as empresas cadastradas." }] }),
  component: Lista,
});

const fmtDoc = (d?: string | null) => { const x = onlyDigits(d ?? ""); return !x ? "—" : x.length === 14 ? maskCNPJ(x) : maskCPF(x); };
const tipoLabel = (t?: string | null) => BUSINESS_TYPES.find((b) => b.value === t)?.label ?? "—";
const fmtDia = (d?: string | null) => (d ? format(new Date(d + "T12:00:00"), "dd/MM/yyyy") : "—");
const waLink = (n?: string | null, text?: string) => `https://wa.me/${onlyDigits(n ?? "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

function Lista() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = Math.max(1, search.page);
  const [qInput, setQInput] = useState(search.q);
  useEffect(() => { const t = setTimeout(() => { if (qInput !== search.q) navigate({ search: (p) => ({ ...p, q: qInput, page: 1 }) }); }, 350); return () => clearTimeout(t); }, [qInput]); // eslint-disable-line

  const setF = (k: "status" | "tipo" | "plano", v: string) => navigate({ search: (p) => ({ ...p, [k]: v, page: 1 }) });

  const { data: planos } = useQuery({
    queryKey: ["system-plans-all"],
    queryFn: async () => (await supabase.from("system_plan").select("id, nome, valor, ativo").order("valor")).data ?? [],
  });

  const { data, refetch } = useQuery({
    queryKey: ["master-empresas", search.q, search.status, search.tipo, search.plano, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const [from, to] = pageRange(page);
      let q = supabase.from("academy").select("*, system_plan(nome)", { count: "exact" }).order("created_at", { ascending: false });
      const { text, digits } = normalizeSearch(search.q);
      if (text) {
        const ors = [`name.ilike.%${text}%`];
        if (digits) ors.push(`documento.ilike.%${digits}%`, `cnpj.ilike.%${digits}%`, `owner_cpf.ilike.%${digits}%`);
        q = q.or(ors.join(","));
      }
      if (search.status === "ativas") q = q.in("status", ["active", "trial"]);
      if (search.status === "inativas") q = q.eq("status", "blocked");
      if (search.tipo !== "todos") q = q.eq("tipo_empresa", search.tipo as never);
      if (search.plano !== "todos") q = q.eq("system_plan_id", search.plano);
      const { data, count, error } = await q.range(from, to);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });
  const rows = data?.rows ?? [];
  const count = data?.count ?? 0;
  const pages = totalPages(count);

  const statusFn = useServerFn(setAcademiaStatus);
  const delFn = useServerFn(excluirAcademia);
  const [view, setView] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [senhaFor, setSenhaFor] = useState<any>(null);
  const [suspend, setSuspend] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [delConfirm, setDelConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const doStatus = async () => {
    if (!suspend) return; setBusy(true);
    try {
      const ativa = !isActiveStatus(suspend.status);
      await statusFn({ data: { academy_id: suspend.id, ativa } });
      toast.success(ativa ? "Empresa reativada" : "Empresa suspensa"); refetch();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); setSuspend(null); }
  };
  const doDelete = async () => {
    if (!del) return; setBusy(true);
    try { await delFn({ data: { academy_id: del.id } }); toast.success("Empresa excluída"); setDel(null); refetch(); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const hasFilters = search.q || search.status !== "todas" || search.tipo !== "todos" || search.plano !== "todos";

  return (
    <div>
      <PageHeader title="EMPRESAS" description="Todas as empresas cadastradas." actions={<Link to="/master/novaempresa"><Button>Nova Empresa</Button></Link>} />

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar por nome, CNPJ ou CPF" value={qInput} onChange={(e) => setQInput(e.target.value)} />
          </div>
          <Select value={search.status} onValueChange={(v) => setF("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todas">Todos status</SelectItem><SelectItem value="ativas">Ativas</SelectItem><SelectItem value="inativas">Inativas</SelectItem></SelectContent>
          </Select>
          <Select value={search.tipo} onValueChange={(v) => setF("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos os tipos</SelectItem>{BUSINESS_TYPES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={search.plano} onValueChange={(v) => setF("plano", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos os planos</SelectItem>{(planos ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" disabled={!hasFilters} onClick={() => { setQInput(""); navigate({ search: { q: "", status: "todas", tipo: "todos", plano: "todos", page: 1 } }); }}>
            <X className="h-4 w-4 mr-1" />Limpar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead><TableHead>CNPJ/CPF</TableHead><TableHead>Tipo</TableHead><TableHead>Plano</TableHead>
                <TableHead>Status</TableHead><TableHead>Vencimento</TableHead><TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a: any) => {
                const ativa = isActiveStatus(a.status);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="font-mono text-xs">{fmtDoc(a.documento ?? a.cnpj ?? a.owner_cpf)}</TableCell>
                    <TableCell className="text-sm">{tipoLabel(a.tipo_empresa)}</TableCell>
                    <TableCell><Badge variant="outline">{a.system_plan?.nome ?? "Sem plano"}</Badge></TableCell>
                    <TableCell><Badge variant={ativa ? "default" : "destructive"}>{ativa ? "Ativa" : "Inativa"}</Badge></TableCell>
                    <TableCell>{fmtDia(a.data_vencimento)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setView(a)}><Eye className="h-4 w-4 mr-2" />Ver Empresa</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEdit(a)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem disabled={!a.whatsapp} onClick={() => window.open(waLink(a.whatsapp, `Olá ${a.owner_nome ?? ""}!`), "_blank")}><MessageCircle className="h-4 w-4 mr-2" />Falar no WhatsApp</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSenhaFor(a)}><KeyRound className="h-4 w-4 mr-2" />Alterar Senha do Admin</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSuspend(a)}>
                            {ativa ? <><Pause className="h-4 w-4 mr-2" />Suspender Empresa</> : <><Play className="h-4 w-4 mr-2" />Reativar Empresa</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setDelConfirm(""); setDel(a); }}><Trash2 className="h-4 w-4 mr-2" />Excluir Empresa</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Nenhuma empresa encontrada.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-sm">
        <span className="text-muted-foreground">
          {count === 0 ? "0 empresas" : `Mostrando ${(page - 1) * EMPRESAS_PAGE_SIZE + 1}–${Math.min(page * EMPRESAS_PAGE_SIZE, count)} de ${count}`}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}>Anterior</Button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Button key={n} size="sm" variant={n === page ? "default" : "outline"} onClick={() => navigate({ search: (p) => ({ ...p, page: n }) })}>{n}</Button>
          ))}
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}>Próxima</Button>
        </div>
      </div>

      <ViewDialog a={view} onClose={() => setView(null)} />
      {edit && <EditDialog a={edit} planos={planos ?? []} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refetch(); }} />}
      {senhaFor && <SenhaDialog a={senhaFor} onClose={() => setSenhaFor(null)} />}

      <AlertDialog open={!!suspend} onOpenChange={(o) => { if (!o) setSuspend(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{suspend && isActiveStatus(suspend.status) ? "Suspender empresa?" : "Reativar empresa?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {suspend && isActiveStatus(suspend.status) ? <>A empresa <b>{suspend?.name}</b> ficará Inativa.</> : <>A empresa <b>{suspend?.name}</b> voltará a ficar Ativa.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={doStatus}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!del} onOpenChange={(o) => { if (!o) setDel(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir empresa</DialogTitle>
            <DialogDescription>Isso apaga <b>{del?.name}</b> e todos os seus dados (alunos, planos, check-ins, financeiro, agenda, equipe, leads e acessos). Não pode ser desfeito.</DialogDescription>
          </DialogHeader>
          <Label>Digite o nome da empresa para confirmar</Label>
          <Input value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} placeholder={del?.name} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDel(null)} disabled={busy}>Cancelar</Button>
            <Button variant="destructive" disabled={busy || delConfirm.trim() !== del?.name} onClick={doDelete}>{busy ? "Excluindo…" : "Excluir definitivamente"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return <div><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="text-sm break-words">{value || "—"}</div></div>;
}

function ViewDialog({ a, onClose }: { a: any; onClose: () => void }) {
  const { data: extra } = useQuery({
    enabled: !!a,
    queryKey: ["empresa-view", a?.id],
    queryFn: async () => {
      const [rt, adm] = await Promise.all([
        supabase.from("academy_technical_responsible").select("nome, conselho, numero_registro, uf").eq("academy_id", a.id),
        supabase.from("academy_user").select("nome, email").eq("academy_id", a.id).eq("role", "admin"),
      ]);
      return { rts: rt.data ?? [], admins: adm.data ?? [] };
    },
  });
  const e = a?.endereco ?? {};
  return (
    <Dialog open={!!a} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{a?.name}</DialogTitle><DialogDescription>{tipoLabel(a?.tipo_empresa)}</DialogDescription></DialogHeader>
        {a && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CNPJ/CPF" value={fmtDoc(a.documento ?? a.cnpj)} />
              <Field label="Status" value={isActiveStatus(a.status) ? "Ativa" : "Inativa"} />
              <Field label="Plano" value={a.system_plan?.nome} />
              <Field label="Valor mensal" value={fmtBRL(Number(a.valor_mensal ?? 0))} />
              <Field label="Vencimento" value={fmtDia(a.data_vencimento)} />
              <Field label="Criada em" value={format(new Date(a.created_at), "dd/MM/yyyy")} />
              <Field label="Link público" value={a.slug ? `/agendar/${a.slug}` : ""} />
              <Field label="Cor" value={a.cor_primaria} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <Field label="Email" value={a.email} /><Field label="Telefone" value={a.telefone} />
              <Field label="WhatsApp" value={a.whatsapp} /><Field label="Instagram" value={a.instagram} />
            </div>
            <div className="border-t pt-4">
              <Field label="Endereço" value={[e.rua, e.numero, e.bairro, e.cidade, e.uf, e.cep].filter(Boolean).join(", ")} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <Field label="Admin" value={(extra?.admins ?? []).map((x) => `${x.nome ?? ""} <${x.email}>`).join(", ") || a.owner_email} />
              <Field label="Responsáveis técnicos" value={(extra?.rts ?? []).map((r) => `${r.nome} (${r.conselho} ${r.numero_registro}${r.uf ? "/" + r.uf : ""})`).join("; ")} />
            </div>
          </div>
        )}
        <DialogFooter><Button onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ a, planos, onClose, onSaved }: { a: any; planos: any[]; onClose: () => void; onSaved: () => void }) {
  const fn = useServerFn(updateAcademia);
  const wa = splitWhatsapp(a.whatsapp);
  const e = a.endereco ?? {};
  const [f, setF] = useState({
    nome: a.name ?? "", slug: a.slug ?? "", documento: fmtDoc(a.documento ?? a.cnpj).replace("—", ""), tipo_empresa: a.tipo_empresa ?? "academia",
    cor_principal: a.cor_primaria ?? "#F97316", telefone: a.telefone ?? "", whatsapp_ddi: wa.ddi, whatsapp: wa.numero, email: a.email ?? "",
    cep: e.cep ?? "", rua: e.rua ?? "", numero: e.numero ?? "", bairro: e.bairro ?? "", cidade: e.cidade ?? "", uf: e.uf ?? "",
    system_plan_id: a.system_plan_id ?? "", valor_mensal: String(a.valor_mensal ?? 0), data_vencimento: a.data_vencimento ?? "",
  });
  const [busy, setBusy] = useState(false);
  const s = (k: keyof typeof f) => (ev: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: ev.target.value }));
  const docD = onlyDigits(f.documento);
  const docOk = docD.length === 0 || (docD.length === 11 && isValidCPF(docD)) || (docD.length === 14 && isValidCNPJ(docD));

  const save = async () => {
    if (!docOk) return toast.error("CPF/CNPJ inválido");
    if (!f.system_plan_id) return toast.error("Selecione um plano");
    setBusy(true);
    try {
      await fn({ data: {
        academy_id: a.id, nome: f.nome, slug: f.slug, documento: f.documento, tipo_empresa: f.tipo_empresa as any, cor_principal: f.cor_principal,
        telefone: f.telefone, whatsapp_ddi: f.whatsapp_ddi, whatsapp: f.whatsapp, email: f.email,
        endereco: { cep: f.cep, rua: f.rua, numero: f.numero, bairro: f.bairro, cidade: f.cidade, uf: f.uf.toUpperCase().slice(0, 2) },
        system_plan_id: f.system_plan_id, valor_mensal: Number(f.valor_mensal.replace(",", ".")) || 0, data_vencimento: f.data_vencimento,
      } });
      toast.success("Empresa atualizada"); onSaved();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Nome</Label><Input value={f.nome} onChange={s("nome")} /></div>
          <div><Label>Slug público</Label><Input value={f.slug} onChange={(ev) => setF((p) => ({ ...p, slug: ev.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") }))} /></div>
          <div><Label>CNPJ/CPF</Label><Input value={f.documento} onChange={(ev) => { const d = onlyDigits(ev.target.value); setF((p) => ({ ...p, documento: d.length > 11 ? maskCNPJ(d) : maskCPF(d) })); }} className={docOk ? "" : "border-destructive"} /></div>
          <div><Label>Tipo de Empresa</Label>
            <Select value={f.tipo_empresa} onValueChange={(v) => setF((p) => ({ ...p, tipo_empresa: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Cor principal</Label><Input type="color" value={f.cor_principal} onChange={s("cor_principal")} className="h-10 p-1" /></div>
          <div><Label>Email</Label><Input value={f.email} onChange={s("email")} /></div>
          <div><Label>Telefone</Label><Input value={f.telefone} onChange={s("telefone")} /></div>
          <div className="col-span-2"><Label>WhatsApp</Label>
            <div className="flex gap-2">
              <Select value={f.whatsapp_ddi} onValueChange={(v) => setF((p) => ({ ...p, whatsapp_ddi: v }))}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{DDIS.map((d) => <SelectItem key={d.code} value={d.code}>{d.label}</SelectItem>)}</SelectContent></Select>
              <Input value={f.whatsapp} onChange={s("whatsapp")} placeholder="DDD + número" />
            </div></div>
          <div><Label>CEP</Label><Input value={f.cep} onChange={s("cep")} /></div>
          <div><Label>Rua</Label><Input value={f.rua} onChange={s("rua")} /></div>
          <div><Label>Número</Label><Input value={f.numero} onChange={s("numero")} /></div>
          <div><Label>Bairro</Label><Input value={f.bairro} onChange={s("bairro")} /></div>
          <div><Label>Cidade</Label><Input value={f.cidade} onChange={s("cidade")} /></div>
          <div><Label>UF</Label><Input value={f.uf} maxLength={2} onChange={s("uf")} /></div>
          <div><Label>Plano</Label>
            <Select value={f.system_plan_id} onValueChange={(v) => { const p = planos.find((x) => x.id === v); setF((o) => ({ ...o, system_plan_id: v, valor_mensal: p ? String(p.valor) : o.valor_mensal })); }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{planos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}{p.ativo ? "" : " (inativo)"}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Valor mensal (R$)</Label><Input value={f.valor_mensal} onChange={s("valor_mensal")} /></div>
          <div><Label>Data de Vencimento</Label><Input type="date" value={f.data_vencimento} onChange={s("data_vencimento")} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SenhaDialog({ a, onClose }: { a: any; onClose: () => void }) {
  const fn = useServerFn(alterarSenhaAdmin);
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ email: string; senha: string; nome_admin: string } | null>(null);

  const run = async (gerar: boolean) => {
    if (!gerar && !isStrongPassword(senha)) return toast.error("Senha não atende aos requisitos");
    setBusy(true);
    try { setRes(await fn({ data: { academy_id: a.id, senha: gerar ? "" : senha } })); toast.success("Senha alterada"); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const msg = res ? `Olá ${res.nome_admin}! Seu acesso ao GymBoss AI (${a.name}):\nEmail: ${res.email}\nSenha: ${res.senha}\nAcesse: ${typeof window !== "undefined" ? window.location.origin : ""}/entrar` : "";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Alterar Senha do Admin</DialogTitle><DialogDescription>{a.name}</DialogDescription></DialogHeader>
        {!res ? (
          <>
            <Label>Nova senha</Label>
            <div className="flex gap-2">
              <Input type={show ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} />
              <Button type="button" variant="outline" size="icon" onClick={() => setShow(!show)} aria-label="Mostrar senha">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
            </div>
            <ul className="text-xs space-y-1">
              {PASSWORD_RULES.map((r) => <li key={r.key} className={r.test(senha) ? "text-primary" : "text-muted-foreground"}><Check className="inline h-3 w-3 mr-1" />{r.label}</li>)}
            </ul>
            <DialogFooter className="gap-2">
              <Button variant="outline" disabled={busy} onClick={() => run(true)}>Gerar automática</Button>
              <Button disabled={busy || !isStrongPassword(senha)} onClick={() => run(false)}>Salvar senha</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="bg-muted/50 rounded p-3"><div className="text-xs uppercase text-muted-foreground">Email</div><div className="text-sm">{res.email}</div></div>
            <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
              <div className="flex-1"><div className="text-xs uppercase text-muted-foreground">Senha</div><div className="font-mono">{res.senha}</div></div>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(res.senha); toast.success("Copiado"); }}><Copy className="h-3 w-3" /></Button>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" disabled={!a.whatsapp} onClick={() => window.open(waLink(a.whatsapp, msg), "_blank")}><MessageCircle className="h-4 w-4 mr-1" />Enviar acesso</Button>
              <Button onClick={onClose}>Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
