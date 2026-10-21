import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/listaAcademias")({
  beforeLoad: () => {
    throw redirect({ to: "/master/listaempresa", replace: true });
  },
});
