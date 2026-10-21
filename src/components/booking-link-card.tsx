import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Download, Link2 } from "lucide-react";
import { toast } from "sonner";

export function BookingLinkCard({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const url = useMemo(() => {
    if (typeof window === "undefined") return `/agendar/${slug}`;
    return `${window.location.origin}/agendar/${slug}`;
  }, [slug]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Link copiado"); }
    catch { toast.error("Nao foi possivel copiar"); }
  };

  const download = () => {
    const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `qr-${slug}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start gap-4">
          <div ref={ref} className="bg-white p-2 rounded-lg shrink-0">
            <QRCodeCanvas value={url} size={compact ? 88 : 120} level="M" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300 mb-1">
              <Link2 className="h-4 w-4" /> Link publico de matricula
            </div>
            <div className="text-xs text-muted-foreground mb-2 truncate font-mono">{url}</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3 w-3 mr-1" />Copiar</Button>
              <Button size="sm" variant="outline" asChild>
                <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Abrir</a>
              </Button>
              <Button size="sm" variant="outline" onClick={download}><Download className="h-3 w-3 mr-1" />Baixar QR</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}