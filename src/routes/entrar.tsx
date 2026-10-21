import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/entrar")({ component: Entrar });

function Entrar() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app/dashboard", replace: true });
  }, [user, loading, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/app/dashboard", replace: true });
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error, confirmed } = await signUp(email, password);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (confirmed) navigate({ to: "/app/dashboard", replace: true });
    else toast.success("Confirme seu email para entrar.");
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app/dashboard" });
    if (result.error) { toast.error(result.error.message ?? "Falha no login com Google"); setBusy(false); return; }
    if (result.redirected) return;
    navigate({ to: "/app/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Gym Hub</span>
        </div>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-3 mt-4">
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div><Label>Senha</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Entrar</Button>
                  <div className="text-center"><Link to="/esqueci-senha" className="text-sm text-muted-foreground hover:text-primary">Esqueci a senha</Link></div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-3 mt-4">
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div><Label>Senha</Label><Input type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Criar conta</Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" /><span className="text-xs text-muted-foreground">ou</span><Separator className="flex-1" />
            </div>
            <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={onGoogle}>
              Continuar com Google
            </Button>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}
