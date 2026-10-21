## GymBoss AI — Plano de implementação

Escopo gigante (SaaS multi-tenant, 4 tiers, ~25 rotas, onboarding, billing, demo, master). Vou entregar em **fases**, cada fase funcional e testável. Pendências ficarão claramente listadas no final.

### Premissas
- **Recomeço**: vou apagar as rotas atuais (`_authenticated/*`, `dashboard`, `alunos`, etc.) e o esquema atual será **estendido** (não dropado) — adicionar `user_roles`, ajustar RLS, novos campos. Dados existentes preservados.
- **Brand**: `--brand: #D97634`, sidebar tenant `#151310`, master vermelho, surface `#F8F7F3`. Tokens em `src/styles.css` (oklch).
- **Auth**: Email/senha + Google (broker Lovable). Auto-confirm OFF.
- **Não implementar**: pagamento real (apenas UI/status mockado), envio de email real, IA real (AIGrowth é shell mockado), reset-senha real (UI + chamada Supabase padrão).

### Fase 1 — Schema & RLS
Migration única:
- `user_roles` (user_id, role enum `super_admin|admin|professor|recepcao|personal|demo`, academy_id nullable, UNIQUE)
- Funções: `is_super_admin()`, `current_academy_id()`, `has_role(_uid,_role)` (SECURITY DEFINER)
- Reescrever RLS de todas as tabelas existentes para usar `is_super_admin() OR academy_id = current_academy_id()`
- Adicionar campos faltantes em `academy` (trial_ate default `now()+14d`, valor_mensal, ultimo_acesso)
- Trigger `handle_new_user` cria `user_roles` default (sem role) — role atribuído no onboarding
- Seed: `app_config` singleton com super_admin_emails vazio inicialmente

### Fase 2 — Auth & Guards
- `/entrar` (tabs Entrar | Criar conta, Google OAuth via broker)
- `/esqueci-senha`, `/reset-senha`, `/trocar-senha`
- `_app.tsx` layout = TenantGuard (exige role admin/professor/recepcao/personal + academy_id)
- `_master.tsx` layout = SuperAdminGuard (verifica `is_super_admin()`)
- `_demo.tsx` layout = público, sem guard, banner CTA
- Pós-signup → `/app/onboarding` se sem academia; senão `/app/dashboard`
- TrialBanner global em `_app` (amarelo <3d, laranja inadimplente, vermelho suspenso)

### Fase 3 — Landing pública `/`
Hero "Sua academia sob controle", features (6 cards), pricing R$49/99/199, CTAs para `/entrar` e `/demo/dashboard`.

### Fase 4 — Demo `/demo/*`
- Mock data hardcoded em `src/lib/demo-data.ts` (30 alunos BR, 5 planos, 60 checkins últimos 30d, grade aulas)
- Páginas: Dashboard, Alunos, Planos, Checkins, Financeiro, Relatorios, AIGrowth
- Banner topo com CTA "Criar conta grátis"

### Fase 5 — Onboarding `/app/onboarding`
5 steps: Dados academia → Branding (cor/logo) → Equipe (convite emails) → Planos+Grade aulas (modalidades) → Trial confirma. Ao finalizar: cria `academy`, `academy_user` owner, `user_roles` admin, planos, schedules → `/app/dashboard`.

### Fase 6 — Tenant `/app/*`
Componentes base: `PageHeader`, `KpiCard`, `DataTable`, `FormDialog`, `SidebarTenant`.
- **Dashboard**: 4 KPIs + gráfico 14d checkins (recharts)
- **Alunos**: tabela + form (CRUD)
- **Planos**: tabela + form
- **Checkins fullscreen**: layout especial, busca grande (F2 focus), botão CTA enorme, lista lateral últimos, KPI hoje
- **Agenda**: ScheduleGrid semanal (7 cols × horários), modalidades coloridas
- **Financeiro**: lista receitas/despesas + form
- **Relatórios**: 3-4 gráficos (receita, checkins, alunos por plano)
- **AIGrowth**: shell chat mockado com sugestões prontas
- **Equipe**: lista academy_user + convite
- **Configurações**: Tabs Academia | Equipe | Aparência | Cobrança

### Fase 7 — Master `/master/*`
SidebarMaster vermelha.
- `/master/painel`: MRR, churn, novos, ativas/trial/inadimplentes
- `/master/listaAcademias`: tabela todas academias
- `/master/novaAcademia`: form cria academia + owner

### Stack/convenções
- File-based routing: `src/routes/_app/...`, `src/routes/_master/...`, `src/routes/_demo/...`, `src/routes/entrar.tsx`, etc.
- Queries direto no client com `supabase` + react-query (RLS faz o trabalho). Sem server functions (não precisa para CRUD com RLS).
- Validação: zod + react-hook-form
- date-fns com locale pt-BR
- sonner para toasts

### Pendências/limitações que vão sobrar
- Pagamento real (Stripe) — UI mockada apenas
- Envio email convite equipe — apenas grava em `academy_user`
- AIGrowth — chatbot é shell estático
- Catraca/integração hardware — checkin manual apenas
- Logo upload (storage bucket) — input URL apenas no v1
- Suspensão automática por inadimplência — campo manual em `academy.status`

### Confirmações pedidas antes de começar
1. **Apagar rotas atuais** (`_authenticated/*`, `login.tsx` etc.) e recomeçar do zero — OK?
2. **Manter dados existentes** nas tabelas (só adicionar colunas/funções/RLS novas) — OK?
3. **Sem Stripe real** nesta entrega (cobrança mockada) — OK?
4. Entregar em **uma única resposta gigante** ou parar/revisar ao fim de cada fase?

Aprove para eu começar pela Fase 1 (migration).