import { createFileRoute } from "@tanstack/react-router";
import { useTenant } from "@/lib/tenant-context";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { fmtBRL, fmtDate } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { BookingLinkCard } from "@/components/booking-link-card";
import { CompanyForm } from "@/components/company-form";

export const Route = createFileRoute("/app/configuracoes")({ component: Config });

function Config() {
  const { tenant, refetch } = useTenant();
  const a = tenant?.academy;
  const [name, setName] = useState(a?.name ?? "");
  const { data: slugRow } = useQuery({
    queryKey: ["academy-slug", tenant?.academyId],
    enabled: !!tenant?.academyId,
    queryFn: async () => {
      const { data } = await supabase.from("academy").select("slug").eq("id", tenant!.academyId!).maybeSingle();
      return data;
    },
  });

  void name; void setName;
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const createCompany = async () => {
    if (newName.trim().length < 2) return toast.error("Informe o nome da empresa");
    setCreating(true);
    const { error } = await supabase.rpc("create_academy_with_owner", { p_name: newName.trim(), p_telefone: "", p_email: "", p_cor_primaria: "" });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Empresa criada! Complete o cadastro abaixo.");
    await refetch();
  };


  return (
    <div>
      <PageHeader title="Configurações" />
      {slugRow?.slug && (
        <div className="mb-6 max-w-2xl">
          <div className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Link publico</div>
          <BookingLinkCard slug={slugRow.slug} />
        </div>
      )}
      <Tabs defaultValue="academia">
        <TabsList><TabsTrigger value="academia">Cadastrar Empresa</TabsTrigger><TabsTrigger value="equipe">Equipe</TabsTrigger><TabsTrigger value="aparencia">Aparência</TabsTrigger><TabsTrigger value="cobranca">Cobrança</TabsTrigger></TabsList>
        <TabsContent value="academia">
          {tenant?.academyId
            ? <CompanyForm academyId={tenant.academyId} canEdit={tenant.role === "admin" || tenant.isSuperAdmin} onSaved={() => refetch()} />
            : <Card><CardContent className="p-6 space-y-4 max-w-lg">
                <div>
                  <div className="font-semibold">Cadastrar Empresa</div>
                  <p className="text-sm text-muted-foreground">Você ainda não tem uma empresa vinculada. Informe o nome para começar; em seguida o formulário completo será aberto.</p>
                </div>
                <div><Label>Nome fantasia</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Studio Movimento" /></div>
                <Button onClick={createCompany} disabled={creating}>{creating ? "Criando…" : "Cadastrar Empresa"}</Button>
              </CardContent></Card>}
        </TabsContent>
        <TabsContent value="equipe"><Card><CardContent className="p-6 text-sm text-muted-foreground">Gerencie membros em <a href="/app/equipe" className="text-primary underline">/app/equipe</a>.</CardContent></Card></TabsContent>
        <TabsContent value="aparencia"><Card><CardContent className="p-6"><Label>Cor primária</Label><div className="text-sm text-muted-foreground mt-2">{a?.cor_primaria}</div></CardContent></Card></TabsContent>
        <TabsContent value="cobranca"><Card><CardContent className="p-6 space-y-2 text-sm">
          <div><strong>Plano atual:</strong> {a?.plano}</div>
          <div><strong>Status:</strong> {a?.status}</div>
          <div><strong>Trial até:</strong> {fmtDate(a?.trial_ate)}</div>
          <div><strong>Valor mensal:</strong> {fmtBRL(a?.valor_mensal ?? 0)}</div>
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
