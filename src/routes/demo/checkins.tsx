import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Search, Plus, CheckCircle2, Clock } from "lucide-react";
import { demoFitZoneCheckinsHoje, demoFitZoneStudents } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/checkins")({ component: CheckIns });

function CheckIns() {
  const [scanInput, setScanInput] = useState("");
  const selected = demoFitZoneStudents[0]; // Rafael Souza demo

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Check-ins</h1>
          <p className="text-sm text-zinc-500 mt-1">Registro em tempo real · sincroniza com catraca via webhook</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Hoje</div>
            <div className="text-3xl font-black bg-gradient-to-r from-[#F97316] to-[#FACC15] bg-clip-text text-transparent">142</div>
          </div>
          <Button className="bg-gradient-to-r from-[#F97316] to-[#FACC15] text-white border-0 hover:opacity-90 h-10 px-5 font-bold"><Plus className="h-4 w-4 mr-1.5" /> Novo check-in</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Scan column */}
        <Card className="border-zinc-200 shadow-sm lg:col-span-2">
          <CardContent className="p-6 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Identificação</div>
              <div className="relative">
                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#F97316]" />
                <Input value={scanInput} onChange={e=>setScanInput(e.target.value)} placeholder="Cartão, CPF ou QR code..." className="pl-14 h-16 text-lg font-mono border-2 border-zinc-200 focus:border-[#F97316]" autoFocus />
              </div>
              <div className="text-xs text-zinc-500 mt-2">Pressione Enter para confirmar entrada · ESC para limpar</div>
            </div>

            {/* Aluno preview */}
            <div className="border-2 border-emerald-300 bg-emerald-50/50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <img src={selected.photo_url} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-emerald-200" />
                <div className="flex-1">
                  <div className="font-bold text-zinc-900 text-lg">{selected.name}</div>
                  <div className="text-sm text-zinc-600">{selected.plan_name}</div>
                  <Badge className="bg-emerald-600 text-white border-0 text-[10px] mt-1">PLANO VÁLIDO</Badge>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-200">
                <div><div className="text-xs text-zinc-500 uppercase">Última entrada</div><div className="text-sm font-bold text-zinc-900">{selected.last_checkin_days}d atrás</div></div>
                <div><div className="text-xs text-zinc-500 uppercase">Check-ins mês</div><div className="text-sm font-bold text-zinc-900">{selected.checkin_count_month}</div></div>
              </div>
              <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-bold">Confirmar Entrada</Button>
            </div>
          </CardContent>
        </Card>

        {/* Live feed */}
        <Card className="border-zinc-200 shadow-sm lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                Atividade em tempo real
              </h3>
              <Badge className="bg-zinc-100 text-zinc-700 border-0">{demoFitZoneCheckinsHoje.length} de 142</Badge>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {[...demoFitZoneCheckinsHoje].reverse().map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition">
                  <img src={c.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-zinc-900">{c.student_name}</div>
                    <div className="text-xs text-zinc-500">{c.modalidade} · prof. {c.professor}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-600"><Clock className="h-3 w-3" />{c.hora}</div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
