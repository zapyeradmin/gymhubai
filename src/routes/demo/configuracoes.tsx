import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Palette, Clock, Smartphone, Building2 } from "lucide-react";
import { demoAcademy } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/configuracoes")({ component: Conf });

function Conf() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Configurações</h1>
        <p className="text-sm text-zinc-500 mt-1">Branding, horários, integrações</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3"><Building2 className="h-4 w-4 text-[#F97316]" /><h3 className="font-bold">Identificação</h3></div>
          <Row k="Nome" v={demoAcademy.name} />
          <Row k="Slug" v={demoAcademy.slug} />
          <Row k="CNPJ" v={demoAcademy.cnpj} />
          <Row k="Endereço" v={demoAcademy.endereco.rua} />
        </CardContent></Card>
        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3"><Palette className="h-4 w-4 text-[#F97316]" /><h3 className="font-bold">Branding</h3></div>
          <Row k="Cor primária" v={demoAcademy.cor_primaria} swatch />
          <Row k="Plano" v="Pro" />
          <Row k="Capacidade aula" v="30 alunos" />
        </CardContent></Card>
        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3"><Clock className="h-4 w-4 text-[#F97316]" /><h3 className="font-bold">Horário de funcionamento</h3></div>
          <Row k="Seg-Sex" v={demoAcademy.business_hours.mon_fri} />
          <Row k="Sábado" v={demoAcademy.business_hours.sat} />
          <Row k="Domingo" v={demoAcademy.business_hours.sun} />
        </CardContent></Card>
        <Card className="border-zinc-200 shadow-sm"><CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3"><Smartphone className="h-4 w-4 text-[#F97316]" /><h3 className="font-bold">Integrações</h3></div>
          <IntRow nome="WhatsApp Business" status="conectado" />
          <IntRow nome="PIX (Mercado Pago)" status="conectado" />
          <IntRow nome="Catraca Topdata" status="conectado" />
          <IntRow nome="Stripe (cartões)" status="pendente" />
        </CardContent></Card>
      </div>
    </div>
  );
}

function Row({ k, v, swatch }: { k:string; v:string; swatch?:boolean }) {
  return <div className="flex justify-between py-2 border-b border-zinc-100 last:border-0 text-sm"><span className="text-zinc-500">{k}</span><span className="font-medium text-zinc-900 flex items-center gap-2">{swatch && <span className="h-4 w-4 rounded" style={{background:v}} />}{v}</span></div>;
}
function IntRow({ nome, status }: { nome:string; status:string }) {
  return <div className="flex justify-between py-2 border-b border-zinc-100 last:border-0 text-sm"><span className="text-zinc-700">{nome}</span><Badge className={status==="conectado"?"bg-emerald-100 text-emerald-700 border-0":"bg-amber-100 text-amber-700 border-0"}>{status}</Badge></div>;
}
