# Empresas (/master/listaempresa)

## Página e navegação
- Nova página em `/master/listaempresa` com todo o conteúdo atual; `/master/listaAcademias` passa a redirecionar para ela.
- Menu do Super Admin: "Empresas". Título no topo: "EMPRESAS", com o botão "Nova Empresa".
- Após criar empresa em Nova Empresa, o botão de voltar/lista aponta para a nova página.

## Filtros (barra no topo da lista)
1. Busca: Nome da Empresa, CNPJ ou CPF (aceita com ou sem pontuação).
2. Status: Todas / Ativas / Inativas.
3. Tipo de Empresa: as 6 opções do cadastro.
4. Plano: planos criados em /master/planos.
- Botão "Limpar filtros". Ao mudar um filtro, volta para a página 1.

## Lista
Colunas: Nome, CNPJ/CPF (com máscara), Tipo, Plano, Status ("Ativa" verde / "Inativa" vermelho), Vencimento (DD/MM/AAAA), Ações.
- Ativa = empresa em funcionamento ou em teste; Inativa = suspensa.
- 5 empresas por página, com paginação (Anterior / números / Próxima) e "Mostrando X–Y de Z".

## Ações (menu de cada empresa)
- **Ver Empresa**: janela com todos os dados (empresa, endereço, contato, plano, vencimento, admin, responsáveis técnicos, link público).
- **Editar**: janela com formulário (nome, slug, CNPJ/CPF, tipo, cor, contato com DDI, endereço, plano, valor mensal, data de vencimento) e salvar.
- **Falar no WhatsApp**: abre conversa no WhatsApp da empresa (desativado se não houver número).
- **Alterar Senha do Admin**: janela para digitar a nova senha (mesmas regras fortes do cadastro, mostrar/ocultar) ou gerar automática; mostra as credenciais com opção de copiar e "Enviar acesso" por WhatsApp.
- **Suspender / Reativar Empresa**: alterna o status, com confirmação.
- **Excluir Empresa**: confirmação digitando o nome da empresa; apaga a empresa e todos os seus dados (alunos, planos, check-ins, financeiro, agenda, equipe, leads, acessos de admin). O usuário admin só é removido se não pertencer a outra empresa.

## Detalhes técnicos
- Renomear para `src/routes/master/listaempresa.tsx`; `listaAcademias.tsx` vira stub com `beforeLoad` redirect. Atualizar `sidebar-master.tsx` e links.
- Filtro + paginação no servidor via query Supabase (`ilike` em name, `or` em documento/cnpj por dígitos, `eq` status/tipo_empresa/system_plan_id, `.range()` com `count: "exact"`), estado nos search params (`q`, `status`, `tipo`, `plano`, `page`) com zod `fallback`.
- Novos server functions em `master-academy.functions.ts` (todos com `assertSuperAdmin`): `updateAcademia`, `alterarSenhaAdmin` (senha informada validada por `isStrongPassword` ou gerada), `excluirAcademia` (deleta filhos em ordem e a academy; remove auth user/user_roles quando sem outros vínculos). Suspender/reativar via server fn `setAcademiaStatus`.
- Teste unitário para helper de filtro/paginação (offset por página de 5, normalização de documento na busca).
