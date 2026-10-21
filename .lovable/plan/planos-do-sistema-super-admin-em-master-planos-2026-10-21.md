# Planos do sistema (Super Admin) em /master/planos

## O que você vai ver
- Novo item **"Planos"** no menu do Super Admin, abrindo `/master/planos`.
- Lista de planos em cartões (nome, valor, duração, limite de alunos, recursos liberados, selo "Destaque"), com botão **"Criar Plano"** e opção de editar / ativar-desativar.
- Formulário "Novo Plano":
  1. Nome do Plano
  2. Descrição do Plano
  3. Quantidade de Alunos (Ativos) — limite de alunos ativos
  4. Valor do Plano (R$)
  5. Tipo de Duração: Recorrência (mensal), Trimestral (3 meses), Semestral (6 meses), Anual (12 meses)
  6. Permissões do Plano — caixas de marcar com as páginas/recursos: Dashboard, Alunos, Planos, Agenda, Check-ins, Financeiro, Relatórios, Leads, AI Growth, Equipe, Configurações (Dashboard e Configurações sempre marcados)
  7. Plano Destaque: Sim / Não
  8. Salvar Plano

## Como o plano passa a valer nas empresas
- **Nova academia** (`/master/novaAcademia`): o campo de plano passa a listar os planos criados em `/master/planos` (obrigatório). O valor mensal é preenchido a partir do plano escolhido. Sem nenhum plano criado, o formulário avisa e leva para "Criar Plano".
- **Lista de academias / painel**: mostram o nome do plano real.
- **Dentro da empresa**:
  - O menu mostra só as páginas liberadas pelo plano; abrir uma página bloqueada mostra "Recurso não incluído no seu plano".
  - Ao cadastrar aluno ativo além do limite, o sistema bloqueia com a mensagem "Limite de X alunos ativos do plano atingido". O bloqueio também vale no banco de dados (não dá para burlar pela tela).
  - Super Admin não sofre essas restrições.
- **Empresas já existentes** (hoje com Starter/Pro/Premium): crio automaticamente 3 planos iniciais "Starter", "Pro" e "Premium" com todos os recursos liberados e vinculo cada empresa ao equivalente, para nada parar de funcionar. Você pode editá-los depois.

## Detalhes técnicos
- Nova tabela `public.system_plan` (id, nome, descricao, max_alunos_ativos int, valor numeric, duracao enum `recorrencia|trimestral|semestral|anual`, permissoes text[], destaque bool, ativo bool, timestamps). GRANTs; RLS: SELECT para authenticated, escrita só `is_super_admin()`.
- `academy.system_plan_id uuid` (nullable, FK) + backfill a partir do enum `plano`; coluna `plano` antiga mantida e comentada como DEPRECATED.
- Trigger em `student` (insert/update para status active) que conta ativos da academia e rejeita acima de `max_alunos_ativos`.
- `master-academy.functions.ts`: schema recebe `system_plan_id` (uuid) em vez de `plano`; valida que o plano existe e está ativo.
- `tenant-context`: carrega permissões e limite do plano; `sidebar-tenant` filtra itens; `app.tsx` bloqueia rotas não permitidas.
- Nova rota `src/routes/master/planos.tsx`, item em `sidebar-master.tsx`.
- Teste: limite de alunos e mapeamento de duração (1/3/6/12 meses).
