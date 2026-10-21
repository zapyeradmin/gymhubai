import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enviarEmailStub, type EmailTemplate } from "./email-stub.server";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  template: z.enum(["welcome_academy_admin", "booking_confirmation", "password_reset"]),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const enviarEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => enviarEmailStub(data));

// Convenience helpers (callable from client or server fns)
export async function sendWelcomeEmail(to: string, data: {
  nome_admin: string; nome_academia: string; senha: string; link_publico: string;
}) {
  return enviarEmail({
    data: { to, subject: `Bem-vindo a ${data.nome_academia} - GymBoss AI`, template: "welcome_academy_admin" as EmailTemplate, data },
  });
}

export async function sendBookingConfirmation(to: string, data: {
  nome: string; tipo: string; academia: string;
}) {
  return enviarEmail({
    data: { to, subject: `Confirmacao - ${data.academia}`, template: "booking_confirmation" as EmailTemplate, data },
  });
}

export async function sendPasswordResetEmail(to: string, data: {
  nome_admin: string; nova_senha: string; nome_academia: string;
}) {
  return enviarEmail({
    data: { to, subject: `Sua nova senha - ${data.nome_academia}`, template: "password_reset" as EmailTemplate, data },
  });
}