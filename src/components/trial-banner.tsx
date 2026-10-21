import { differenceInDays, parseISO } from "date-fns";
import { useTenant } from "@/lib/tenant-context";
import { Link } from "@tanstack/react-router";

export function TrialBanner() {
  const { tenant } = useTenant();
  if (!tenant?.academy) return null;
  const a = tenant.academy;

  if (a.status === "blocked") {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center">
        Sua academia está suspensa. <Link to="/app/configuracoes" className="underline font-medium">Regularizar cobrança</Link>
      </div>
    );
  }

  if (a.status === "trial" && a.trial_ate) {
    const days = differenceInDays(parseISO(a.trial_ate), new Date());
    if (days <= 3 && days >= 0) {
      return (
        <div className="bg-yellow-400 text-yellow-950 px-4 py-2 text-sm text-center">
          Seu trial termina em {days} {days === 1 ? "dia" : "dias"}. <Link to="/app/configuracoes" className="underline font-medium">Assinar plano</Link>
        </div>
      );
    }
    if (days < 0) {
      return (
        <div className="bg-orange-500 text-white px-4 py-2 text-sm text-center">
          Trial expirado. <Link to="/app/configuracoes" className="underline font-medium">Assinar para continuar</Link>
        </div>
      );
    }
  }
  return null;
}