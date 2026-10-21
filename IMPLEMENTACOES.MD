# Gym Hub — Implementações realizadas

Registro de todas as implementações, ajustes e novas funções feitas até 21/10/2026.

## 1. Correções e segurança
- Corrigida falha (condição de corrida) no cadastro do primeiro Super Admin.
- Dashboard da empresa passou a mostrar dados reais (antes exibia dados de demonstração).
- Removido botão de desenvolvimento escondido em Configurações.
- Corrigida mensagem enganosa no cadastro de conta.
- Cadastro de aluno sem data de nascimento não gera mais erro (campos vazios salvos como vazios).
- Atualização de segurança dos pacotes do framework.
- Corrigida tela branca causada por arquivos antigos guardados pela prévia.

## 2. Contas
- Super Admin pessoal: **admzapyer@gmail.com** (perfil "Super Administrador", todas as permissões).
- Conta de teste: teste.gymboss@example.com (recomenda-se remover).
- Senhas não são registradas neste arquivo. Redefinição por "Esqueci minha senha".

## 3. Cadastrar Empresa (/app/configuracoes)
- Aba "Cadastrar Empresa" com formulário completo.
- Tipos: Academia de Musculação, Estúdio de Treino Personalizado, Estúdio de Treinamento Funcional, Estúdio de Pilates, Academia de Artes Marciais, Box de CrossFit.
- Identificação: razão social, CNPJ ou CPF (opcional, com máscara e validação), inscrições estadual/municipal.
- Contato (WhatsApp, site, Instagram), endereço com busca automática de CEP, CPF do proprietário.
- Responsáveis Técnicos (vários) com CREF ou CREFITO (Pilates).
- Tabela nova: `academy_technical_responsible`; novas colunas na tabela `academy`.

## 4. Navegação Super Admin
- Botão "Painel Super Admin" na área da empresa (visível só para Super Admin).
- Botão "Voltar para Empresa" no menu e na barra superior da área master.

## 5. Planos do sistema (/master/planos)
- Cartões dos planos com botão "Criar Plano", editar e ativar/desativar.
- Formulário: Nome, Descrição, Quantidade de Alunos (Ativos), Valor, Quantidade de Equipe (Ativos), Tipo de Duração (Recorrência, Trimestral, Semestral, Anual), Permissões (páginas), Plano Destaque.
- Menu da empresa mostra só páginas liberadas; páginas bloqueadas exibem "Recurso não incluído no seu plano".
- Limites de alunos e de equipe bloqueados também no banco. Super Admin não tem restrição.
- Planos iniciais (valores sugeridos, a confirmar): Starter R$97 / 100 alunos / 5 equipe; Pro R$197 / 300 / 15 (destaque); Premium R$397 / 1000 / 50.

## 6. Nova Empresa (/master/novaempresa)
- Substitui /master/novaAcademia (endereço antigo redireciona).
- Dados da Empresa: nome, slug automático, CNPJ/CPF opcional, cor, Tipo de Empresa, Valores (várias linhas de valor + cobrança mensal/trimestral/semestral/anual, viram planos de aluno).
- Endereço, Contato com seletor de DDI no WhatsApp.
- Plano da Empresa: planos de /master/planos, valor mensal automático, Data de Vencimento com calendário.
- Dados de Acesso: nome, email e senha forte do admin (8+ caracteres, maiúscula, minúscula, número, símbolo), mostrar/ocultar.
- Botão "Criar Empresa + Admin" e opção "Enviar acesso" pelo WhatsApp.

## 7. Empresas (/master/listaempresa)
- Substitui /master/listaAcademias (endereço antigo redireciona). Menu "Empresas", título "EMPRESAS".
- Filtros: busca por nome/CNPJ/CPF, status (Ativa/Inativa), Tipo de Empresa, Plano, "Limpar filtros".
- Colunas: Nome, CNPJ/CPF, Tipo, Plano, Status, Vencimento, Ações.
- 5 empresas por página com paginação.
- Ações: Ver Empresa, Editar, Falar no WhatsApp, Alterar Senha do Admin (digitada ou gerada, com envio por WhatsApp), Suspender/Reativar, Excluir (confirmação pelo nome; apaga todos os dados da empresa).
- Regras definidas: empresa em teste aparece como Ativa; senha gerada exige troca no próximo acesso.

## 8. Banco de dados (alterações)
- 0000: correção do cadastro do primeiro Super Admin.
- 0001: tipo de empresa, novos dados da empresa, tabela de responsáveis técnicos.
- 0002: tabela `system_plan`, vínculo da empresa ao plano, limite de alunos.
- 0003: limite de equipe por plano.
- 0004: data de vencimento da empresa.
- 0005: nome do app no banco atualizado para "Gym Hub".

## 9. Testes automáticos
- Validação de CPF/CNPJ e máscaras.
- Duração dos planos, permissões de páginas, limites de alunos e equipe.
- Regras de senha forte e cobrança → meses.
- Filtro e paginação da lista de empresas.

## 10. Pendências
- Publicar o app.
- Confirmar valores e limites dos planos iniciais.
- Testar de ponta a ponta a criação em Nova Empresa e as ações da lista.
- Remover a conta de teste.

## 11. Nome do produto
- Nome alterado de "GymBoss AI" para **Gym Hub** em todo o site: página inicial (topo, rodapé e direitos autorais), títulos de todas as páginas, mensagens de WhatsApp (criação de empresa e envio de acesso), e-mail de boas-vindas, área de demonstração e cadastro do app no banco de dados.
- Mantido de propósito: o e-mail da conta de teste `teste.gymboss@example.com` (é o endereço real da conta) e o texto do arquivo de migração 0000, que já foi executado.
