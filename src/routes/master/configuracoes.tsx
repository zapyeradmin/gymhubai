import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ExternalLink, Info } from "lucide-react";

export const Route = createFileRoute("/master/configuracoes")({ component: Config });

function Config() {
  return (
    <div>
      <PageHeader title="Configuracoes do sistema" description="Integracoes globais da plataforma." />
      <Card className="max-w-3xl border-yellow-300 bg-yellow-50/40 dark:bg-yellow-950/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm font-semibold">
            <Mail className="h-4 w-4" /> Envio de email — MODO STUB
          </div>
          <p className="text-sm text-muted-foreground">
            O envio de email esta em modo stub. Para ativar emails reais com a sua marca,
            conecte sua conta Resend.
          </p>
          <a href="https://resend.com" target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1 text-orange-600 hover:underline text-sm font-medium">
            resend.com <ExternalLink className="h-3 w-3" />
          </a>

          <div className="rounded-md border bg-background p-4 text-sm space-y-2">
            <div className="font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-orange-500" />Passo a passo</div>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Criar conta gratis em resend.com.</li>
              <li>Verificar seu dominio (ou usar onboarding@resend.dev em testes).</li>
              <li>Copiar a API key gerada (re_...).</li>
              <li>Adicionar <code className="bg-muted px-1 rounded">RESEND_API_KEY</code> nos secrets do Lovable Cloud.</li>
              <li>Descomentar o codigo apontado em <code className="bg-muted px-1 rounded">src/lib/email-stub.server.ts</code>.</li>
            </ol>
          </div>

          <div className="text-xs text-muted-foreground">
            Enquanto estiver em stub, as chamadas <code>sendWelcomeEmail</code>, <code>sendBookingConfirmation</code> e <code>sendPasswordResetEmail</code>
            apenas escrevem o payload no console do servidor.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}