import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, "Slug invalido (use a-z, 0-9, -)"),
  cor_principal: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F97316"),
  telefone: z.string().max(40).optional().default(""),
  whatsapp: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  cnpj: z.string().max(20).optional().default(""),
  endereco: z.object({
    cep: z.string().max(15).optional().default(""),
    rua: z.string().max(200).optional().default(""),
    numero: z.string().max(20).optional().default(""),
    bairro: z.string().max(100).optional().default(""),
    cidade: z.string().max(100).optional().default(""),
    uf: z.string().max(2).optional().default(""),
  }),
  capacidade_max: z.number().int().min(1).max(5000).default(200),
  mensalidade_basica: z.number().min(0).max(99999).default(89),
  plano: z.enum(["starter", "pro", "premium"]).default("pro"),
  valor_mensal: z.number().min(0).max(99999).default(197),
  dia_vencimento: z.number().int().min(1).max(28).default(10),
  email_admin: z.string().email(),
  nome_admin: z.string().min(2).max(120),
});

export const createAcademiaWithOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("academy").select("id").eq("slug", data.slug).maybeSingle();
    if (existing) throw new Error(`Slug "${data.slug}" ja esta em uso.`);

    const senha = genPassword(12);

    // Create academy
    const { data: acad, error: acErr } = await supabaseAdmin
      .from("academy")
      .insert({
        name: data.nome,
        slug: data.slug,
        cor_primaria: data.cor_principal,
        telefone: data.telefone || null,
        email: data.email || null,
        cnpj: data.cnpj || null,
        endereco: data.endereco,
        capacity_per_class: data.capacidade_max,
        valor_mensal: data.valor_mensal,
        plano: data.plano,
        status: "active",
        owner_nome: data.nome_admin,
        owner_email: data.email_admin.toLowerCase(),
        owner_telefone: data.whatsapp || data.telefone || null,
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
      must_change_password: true,
    });

    // user_roles
    await supabaseAdmin.from("user_roles").insert({
      user_id: authUserId,
      role: "admin",
      academy_id: acad.id,
    });

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