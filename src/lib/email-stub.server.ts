// =======================================================================
// TODO: aluno que clonar deve conectar sua propria conta Resend aqui
// (RESEND_API_KEY no env do Lovable Cloud + `import { Resend } from "resend";`)
// Quando ativar Resend de verdade:
//   const resend = new Resend(process.env.RESEND_API_KEY!);
//   await resend.emails.send({ from, to, subject, html });
// =======================================================================

export type EmailTemplate =
  | "welcome_academy_admin"
  | "booking_confirmation"
  | "password_reset";

export type EnviarEmailPayload = {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
};

export async function enviarEmailStub(payload: EnviarEmailPayload) {
  // eslint-disable-next-line no-console
  console.log("[EMAIL STUB] (Resend nao configurado)", JSON.stringify(payload, null, 2));
  return { success: true as const, stub: true as const };
}