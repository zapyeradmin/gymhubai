import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-senha")({ component: Reset });

function Reset() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Senha atualizada."); navigate({ to: "/app/dashboard" }); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold">Nova senha</h1>
          <form onSubmit={onSubmit} className="space-y-3 mt-4">
            <div><Label>Nova senha</Label><Input type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={busy}>Atualizar senha</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}