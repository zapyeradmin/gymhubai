import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({ component: Esqueci });

function Esqueci() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-senha`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Email de redefinição enviado.");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold">Esqueci a senha</h1>
          <p className="text-sm text-muted-foreground mt-1">Enviaremos um link para o seu email.</p>
          <form onSubmit={onSubmit} className="space-y-3 mt-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={busy}>Enviar link</Button>
          </form>
          <div className="text-center mt-4"><Link to="/entrar" className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}