import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { onlyDigits, isValidCPF, isValidCNPJ } from "@/lib/documento";
import { isStrongPassword, cobrancaLabel, cobrancaMonths } from "@/lib/empresa";

function genPassword(len = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const sym = "!@#$%&*?";
  const all = upper + lower + nums + sym;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(upper) + pick(lower) + pick(nums) + pick(sym);
  while (out.length < len) out += pick(all);
  return out.split("").sort(() => Math.random() - 0.5).join("");
}

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Apenas super_admin pode executar esta acao.");
}

const createSchema = z.object({
  nome: z.string().min(2).max(120),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalido (use a-z, 0-9, -)"),
  cor_principal: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F97316"),
  tipo_empresa: z.enum(["academia", "estudio_personal", "estudio_funcional", "estudio_pilates", "artes_marciais", "box_crossfit"]),
  documento: z.string().max(20).optional().default("").refine((v) => {
    const d = onlyDigits(v);
    return d.length === 0 || (d.length === 11 && isValidCPF(d)) || (d.length === 14 && isValidCNPJ(d));
  }, "CPF/CNPJ invalido"),
  valores: z.array(z.object({
    valor: z.number().min(0).max(99999),
    cobranca: z.enum(["mensal", "trimestral", "semestral", "anual"]),
  })).max(20).default([]),
  telefone: z.string().max(40).optional().default(""),
  whatsapp_ddi: z.string().regex(/^\d{1,4}$/).default("55"),
  whatsapp: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  endereco: z.object({
    cep: z.string().max(15).optional().default(""),
    rua: z.string().max(200).optional().default(""),
    numero: z.string().max(20).optional().default(""),
    bairro: z.string().max(100).optional().default(""),
    cidade: z.string().max(100).optional().default(""),
    uf: z.string().max(2).optional().default(""),
  }),
  system_plan_id: z.string().uuid({ message: "Selecione um plano" }),
  valor_mensal: z.number().min(0).max(99999).default(197),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")).default(""),
  email_admin: z.string().email(),
  nome_admin: z.string().min(2).max(120),
  senha_admin: z.string().max(72).refine(isStrongPassword, "Senha fraca: minimo 8 caracteres com maiuscula, minuscula, numero e simbolo"),
});

export const createAcademiaWithOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: plan } = await supabaseAdmin
      .from("system_plan").select("id, nome, ativo").eq("id", data.system_plan_id).maybeSingle();
    if (!plan || !plan.ativo) throw new Error("Plano inexistente ou inativo.");
    const legacy = (["starter", "pro", "premium"] as const).find((p) => p === plan.nome.toLowerCase()) ?? "pro";

    const { data: existing } = await supabaseAdmin
      .from("academy").select("id").eq("slug", data.slug).maybeSingle();
    if (existing) throw new Error(`Slug "${data.slug}" ja esta em uso.`);

    const senha = data.senha_admin;
    const doc = onlyDigits(data.documento);
    const docTipo = doc.length === 14 ? "cnpj" : doc.length === 11 ? "cpf" : null;
    const waDigits = onlyDigits(data.whatsapp);
    const waFull = waDigits ? `+${data.whatsapp_ddi}${waDigits}` : null;

    const { data: acad, error: acErr } = await supabaseAdmin
      .from("academy")
      .insert({
        name: data.nome,
        slug: data.slug,
        cor_primaria: data.cor_principal,
        tipo_empresa: data.tipo_empresa,
        documento_tipo: docTipo,
        documento: doc || null,
        cnpj: docTipo === "cnpj" ? doc : null,
        telefone: data.telefone || null,
        whatsapp: waFull,
        email: data.email || null,
        endereco: data.endereco,
        valor_mensal: data.valor_mensal,
        data_vencimento: data.data_vencimento || null,
        plano: legacy,
        system_plan_id: plan.id,
        status: "active",
        owner_nome: data.nome_admin,
        owner_email: data.email_admin.toLowerCase(),
        owner_telefone: waFull || data.telefone || null,
      })
      .select("id, slug")
      .single();
    if (acErr || !acad) throw new Error(acErr?.message ?? "Falha ao criar academia.");

    // Create / find auth user
    let authUserId: string | null = null;
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email_admin.toLowerCase(),
      password: senha,
      email_confirm: true,
      user_metadata: { nome: data.nome_admin, academia: data.nome },
    });
    if (createErr) {
      // try update password on existing user
      const list = await supabaseAdmin.auth.admin.listUsers();
      const found = list.data.users.find((u) => (u.email ?? "").toLowerCase() === data.email_admin.toLowerCase());
      if (!found) throw new Error(createErr.message);
      authUserId = found.id;
      await supabaseAdmin.auth.admin.updateUserById(found.id, { password: senha });
    } else {
      authUserId = created.user?.id ?? null;
    }
    if (!authUserId) throw new Error("Falha ao obter id do usuario admin.");

    // academy_user link
    await supabaseAdmin.from("academy_user").insert({
      academy_id: acad.id,
      email: data.email_admin.toLowerCase(),
      nome: data.nome_admin,
      role: "admin",
      ativo: true,
      must_change_password: false,
    });

    // user_roles
    await supabaseAdmin.from("user_roles").insert({
      user_id: authUserId,
      role: "admin",
      academy_id: acad.id,
    });

    // Student price plans from "Valores"
    if (data.valores.length) {
      const { error: pErr } = await supabaseAdmin.from("plan").insert(
        data.valores.map((v) => ({
          academy_id: acad.id,
          name: `Plano ${cobrancaLabel(v.cobranca)}`,
          price: v.valor,
          duration_months: cobrancaMonths(v.cobranca),
          active: true,
        })),
      );
      if (pErr) throw new Error(`Empresa criada, mas falhou ao salvar valores: ${pErr.message}`);
    }


    return {
      academy_id: acad.id,
      email_admin: data.email_admin.toLowerCase(),
      senha_gerada: senha,
      slug_publico: acad.slug ?? data.slug,
      link_publico_completo: `/agendar/${acad.slug ?? data.slug}`,
    };
  });

export const resetarSenhaAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ academy_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: au } = await supabaseAdmin
      .from("academy_user")
      .select("email, nome")
      .eq("academy_id", data.academy_id)
      .eq("role", "admin")
      .eq("ativo", true)
      .limit(1)
      .maybeSingle();
    if (!au) throw new Error("Nenhum admin ativo nesta academia.");

    const list = await supabaseAdmin.auth.admin.listUsers();
    const found = list.data.users.find((u) => (u.email ?? "").toLowerCase() === au.email.toLowerCase());
    if (!found) throw new Error("Usuario nao encontrado no Auth.");

    const senha = genPassword(12);
    const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(found.id, { password: senha });
    if (upErr) throw new Error(upErr.message);

    await supabaseAdmin
      .from("academy_user")
      .update({ must_change_password: true })
      .eq("academy_id", data.academy_id)
      .eq("email", au.email);

    return { email: au.email, nova_senha: senha, nome_admin: au.nome ?? "" };
  });