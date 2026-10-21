import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Users, Wallet, Calendar, TrendingUp, MessageCircle, Send } from "lucide-react";
import { demoAIOpportunities, demoAcademy } from "@/lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/aigrowth")({ component: AIGrowth });

const ICONS: Record<string, any> = { users: Users, wallet: Wallet, calendar: Calendar, sparkles: TrendingUp };
const SEV: Record<string, string> = {
  high: "bg-red-100 text-red-700 hover:bg-red-100",
  medium: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  low: "bg-blue-100 text-blue-700 hover:bg-blue-100",
};
const SEV_LABEL: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };

function fillTemplate(tpl: string, t: any) {
  return tpl
    .replaceAll("{nome}", (t.name ?? "").split(" ")[0] ?? "")
    .replaceAll("{academia}", demoAcademy.name)
    .replaceAll("{dias}", String(t.overdueDays ?? t.lastCheckin ?? ""))
    .replaceAll("{valor}", String(t.amount ?? ""))
    .replaceAll("{prazo}", String(t.trialEnd ?? ""))
    .replaceAll("{freq}", String(t.frequency ?? ""));
}

function AIGrowth() {
  const [open, setOpen] = useState<{ op: any; target: any } | null>(null);
  const msg = open ? fillTemplate(open.op.whatsappTemplate, open.target) : "";

  const dispatch = () => {
    if (!open) return;
    toast.success(`Mensagem enviada para ${open.target.name} (mock)`);
    setOpen(null);
  };

  return (
    <div>
      <PageHeader
        title="AI Growth"
        description="Oportunidades detectadas pela IA. Dispare ações com 1 clique."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-[#D97634] to-[#B85A1F] text-white border-0">
          <CardContent className="p-5">
            <div className="text-xs opacity-80">Oportunidades ativas</div>
            <div className="text-4xl font-bold mt-1">{demoAIOpportunities.length}</div>
            <div className="text-xs opacity-80 mt-2">Atualizadas em tempo real</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Receita em risco</div>
            <div className="text-4xl font-bold mt-1 text-red-600">R$ 2.217</div>
            <div className="text-xs text-muted-foreground mt-2">Inadimplência + inatividade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Potencial de reativação</div>
            <div className="text-4xl font-bold mt-1 text-emerald-600">R$ 1.372</div>
            <div className="text-xs text-muted-foreground mt-2">Se agir nas próximas 48h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {demoAIOpportunities.map((o: any) => {
          const Icon = ICONS[o.icon] ?? Sparkles;
          return (
            <Card key={o.id} className="border-[#D97634]/20 hover:border-[#D97634]/50 transition">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-[#D97634]/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#D97634]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{o.title}</h3>
                      <Badge className={`${SEV[o.severity]} shrink-0`}>{SEV_LABEL[o.severity]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{o.description}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D97634]">
                      <Sparkles className="h-3.5 w-3.5" /> {o.impact}
                    </div>

                    {o.targets && (
                      <div className="mt-4 space-y-2">
                        {o.targets.map((t: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-2 border border-border rounded-md p-2.5">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{t.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {t.lastCheckin && <>Último check-in {t.lastCheckin}</>}
                                {t.overdueDays != null && <>Vencido há {t.overdueDays}d — R$ {t.amount}</>}
                                {t.trialEnd && <>Trial termina {t.trialEnd}</>}
                                {t.frequency && <>Frequência: {t.frequency}</>}
                                {t.birthDate && <>Aniversário {t.birthDate}</>}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 border-[#D97634]/40 text-[#D97634] hover:bg-[#D97634]/10"
                              onClick={() => setOpen({ op: o, target: t })}
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>WhatsApp para {open?.target?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Telefone: <span className="font-mono">{open?.target?.phone}</span></div>
            <textarea
              className="w-full border border-border rounded-md p-3 text-sm h-40 leading-relaxed"
              defaultValue={msg}
              key={open?.target?.name}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(null)}>Cancelar</Button>
              <Button onClick={dispatch} className="bg-[#D97634] hover:bg-[#D97634]/90">
                <Send className="h-4 w-4" /> Disparar
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Integração WhatsApp Business é mock. Em produção o envio passa pela API oficial.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}