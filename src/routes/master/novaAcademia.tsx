import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/novaAcademia")({
  beforeLoad: () => {
    throw redirect({ to: "/master/novaempresa", replace: true });
  },
});
