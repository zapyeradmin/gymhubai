# Limite de colaboradores da Equipe por plano

## O que você vai ver
- No formulário "Novo Plano" / "Editar Plano", logo depois de "Valor do Plano": novo campo **"Quantidade de Equipe (Ativos)"** (números, obrigatório).
- Nos cartões dos planos: linha "Até X colaboradores na equipe".
- Na página Equipe da empresa: ao adicionar ou reativar um colaborador além do limite, aparece "Limite de X colaboradores ativos da equipe do plano atingido". O bloqueio vale também no banco (não dá para burlar). Super Admin não tem essa restrição.
- Planos atuais recebem um limite inicial: Starter 5, Pro 15, Premium 50 (valores sugeridos, editáveis).

## Detalhes técnicos
- Migração: `system_plan.max_equipe_ativos integer NOT NULL DEFAULT 10`, backfill dos 3 planos iniciais; trigger `enforce_team_plan_limit` em `team_member` (insert / update de `active` ou `academy_id`), mesmo padrão do limite de alunos.
- `src/routes/master/planos.tsx`: campo no form, estado e exibição no cartão.
- `tenant-context`: incluir `max_equipe_ativos` no plano carregado.
- `src/lib/system-plans.ts`: reutilizar `isOverStudentLimit` como `isOverLimit` genérico; teste para o limite de equipe.
