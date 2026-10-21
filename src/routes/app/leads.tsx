import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/lib/tenant-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/leads")({ component: Leads });

const TYPE_LABEL: Record<string, string> = {
  aula_experimental: "Aula experimental",
  trial_7dias: "Trial 7 dias",
  interesse_plano: "Interesse plano",
};

function Leads() {
  const { tenant } = useTenant();
  const aid = tenant?.academyId;
  const [tipo, setTipo] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");

  const { data, refetch } = useQuery({
    queryKey: ["leads", aid, tipo, status],
    enabled: !!aid,
    queryFn: async () => {
      let q = supabase.from("lead").select("*").eq("academy_id", aid!).order("created_at", { ascending: false });
      if (tipo !== "todos") q = q.eq("type", tipo as any);
      if (status !== "todos") q = q.eq("status", status as any);
      const { data } = await q;
      return data ?? [];
    },
  });

  const setLeadStatus = async (id: string, s: "contatado" | "convertido" | "perdido") => {
    const { error } = await supabase.from("lead").update({ status: s }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Atualizado"); refetch(); }
  };

  return (
    <div>
      <PageHeader title="Leads" description="Cadastros recebidos pelo link publico /agendar." />
      <div className="flex gap-3 mb-4">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="aula_experimental">Aula experimental</SelectItem>
            <SelectItem value="trial_7dias">Trial 7 dias</SelectItem>
            <SelectItem value="interesse_plano">Interesse plano</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="contatado">Contatado</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(l.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="font-mono text-xs">{l.phone}</TableCell>
                  <TableCell><Badge variant="outline">{TYPE_LABEL[l.type] ?? l.type}</Badge></TableCell>
                  <TableCell className="text-xs">{l.modality ?? l.objetivo ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === "convertido" ? "default" : l.status === "perdido" ? "destructive" : "secondary"}>{l.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => setLeadStatus(l.id, "contatado")}>Contatado</Button>
                    <Button size="sm" variant="ghost" onClick={() => setLeadStatus(l.id, "convertido")}>Convertido</Button>
                    <Button size="sm" variant="ghost" onClick={() => setLeadStatus(l.id, "perdido")}>Perdido</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(data ?? []).length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Nenhum lead.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}