import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { resetarSenhaAdmin } from "@/lib/master-academy.functions";
import { sendPasswordResetEmail } from "@/lib/email-client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, KeyRound, Eye, Pause, Copy, AlertTriangle } from "lucide-react";
import { fmtBRL } from "@/lib/format";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/master/listaAcademias")({ component: Lista });

function Lista() {
  const { data: rows, refetch } = useQuery({
    queryKey: ["master-academies"],
    queryFn: async () => {
      const { data } = await supabase.from("academy").select("*, system_plan(nome)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const resetFn = useServerFn(resetarSenhaAdmin);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const [result, setResult] = useState<{ email: string; senha: string; nome_admin: string; academia: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const doReset = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const r = await resetFn({ data: { academy_id: confirm.id } });
      setResult({ email: r.email, senha: r.nova_senha, nome_admin: r.nome_admin, academia: confirm.name });
      await sendPasswordResetEmail(r.email, { nome_admin: r.nome_admin, nova_senha: r.nova_senha, nome_academia: confirm.name });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); setConfirm(null); }
  };

  const suspend = async (id: string) => {
    const { error } = await supabase.from("academy").update({ status: "blocked" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Academia suspensa"); refetch(); }
  };

  return (
    <div>
      <PageHeader
        title="Academias"
        description="Todas as academias cadastradas."
        actions={<Link to="/master/novaempresa"><Button>Nova Empresa</Button></Link>}
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mensal</TableHead>
                <TableHead>Trial até</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows ?? []).map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell><Badge variant="outline">{a.system_plan?.nome ?? "Sem plano"}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={a.status === "active" ? "default" : a.status === "trial" ? "secondary" : "destructive"}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>{fmtBRL(Number(a.valor_mensal ?? 0))}</TableCell>
                  <TableCell>{a.trial_ate ? format(new Date(a.trial_ate), "dd/MM/yyyy") : "—"}</TableCell>
                  <TableCell>{format(new Date(a.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled><Eye className="h-4 w-4 mr-2" />Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirm({ id: a.id, name: a.name })}>
                          <KeyRound className="h-4 w-4 mr-2" />Resetar senha do admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => suspend(a.id)}>
                          <Pause className="h-4 w-4 mr-2" />Suspender academia
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {(rows ?? []).length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Nenhuma academia.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirm} onOpenChange={(o)=>{ if(!o) setConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar senha do admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Uma nova senha sera gerada para o admin de <b>{confirm?.name}</b>. A senha antiga deixa de funcionar imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={doReset}>{busy ? "Resetando…" : "Confirmar reset"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!result} onOpenChange={(o)=>{ if(!o) setResult(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-orange-500" />Nova senha gerada</DialogTitle>
            <DialogDescription>Admin de {result?.academia}</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 p-3 flex gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> Esta senha so aparece uma vez.
          </div>
          <div className="bg-muted/50 rounded p-3">
            <div className="text-xs uppercase text-muted-foreground">Email</div>
            <div className="text-sm">{result?.email}</div>
          </div>
          <div className="bg-muted/50 rounded p-3 flex items-center gap-2">
            <div className="flex-1">
              <div className="text-xs uppercase text-muted-foreground">Senha</div>
              <div className="font-mono">{result?.senha}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { if(result) { navigator.clipboard.writeText(result.senha); toast.success("Copiado"); }}}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setResult(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}