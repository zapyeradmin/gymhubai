import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/trocar-senha")({ component: TrocarSenha });

function TrocarSenha() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Mínimo 6 caracteres."); return; }
    if (password !== confirm) { toast.error("Senhas não conferem."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha atualizada.");
    navigate({ to: "/app/dashboard" });
  };

  return (
    <div>
      <PageHeader title="Trocar senha" description="Atualize sua senha de acesso." />
      <Card className="max-w-md">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Nova senha</Label><Input type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
            <div><Label>Confirmar</Label><Input type="password" minLength={6} value={confirm} onChange={(e)=>setConfirm(e.target.value)} required /></div>
            <Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Trocar senha"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}