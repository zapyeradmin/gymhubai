# Nova Empresa (/master/novaempresa)

## Página e navegação

- Nova página em `/master/novaempresa` com todo o conteúdo atual; o endereço antigo `/master/novaAcademia` passa a redirecionar para o novo (links antigos continuam funcionando).
- Menu do Super Admin: "Nova Empresa". Botão na lista de academias também aponta para a nova página.
- Título no topo: "NOVA EMPRESA".

## Formulário

**Dados da Empresa**

- Nome (texto).
- Slug público: convertido automaticamente para minúsculas, sem acento/caracteres especiais, separado por traço.
- CNPJ/CPF (opcional): aceita os dois, aplica máscara conforme o tamanho e valida os dígitos se preenchido.
- Cor principal: igual a hoje.
- Tipo de Empresa (substitui "Capacidade max"): Academia de Musculação, Estúdio de Treino Personalizado, Estúdio de Treinamento Funcional, Estúdio de Pilates, Academia de Artes Marciais, Box de CrossFit.
- Valores (substitui "Mensalidade básica"): linhas com Valor (R$, formatado em reais) + Tipo de cobrança (Mensal, Trimestral, Semestral, Anual) e botão "+" para adicionar mais linhas (e lixeira para remover). Cada linha vira um plano de aluno já cadastrado na empresa (ex.: "Plano Mensal – R$ 99,00"), aparecendo direto em Planos da empresa.

**Endereço** – só a correção do título ("ENDEREÇO"); campos iguais.

**Contato** – campos iguais; WhatsApp ganha seletor de DDI (padrão +55, lista de países) + número com DDD. Salvo em formato internacional, pronto para envio de mensagens pelo WhatsApp do sistema; o botão "Enviar por WhatsApp" do modal passa a usar o DDI escolhido.

**Plano da Empresa** (antes "Plano e cobrança")

- Plano: lista os planos ativos criados em /master/planos.
- Valor mensal: preenchido automaticamente com o valor do plano escolhido.
- Data de Vencimento: seletor de calendário (DD/MM/AAAA), salvo na empresa.

**Dados de Acesso** (antes "Admin de acesso") – com aviso de que é o admin da empresa, não Super Admin:

- Nome do Admin, Email do Admin.
- Senha do Admin: definida por quem cadastra; mínimo 8 caracteres com maiúscula, minúscula, número e símbolo. Indicador dos requisitos ao vivo e botão mostrar/ocultar. Sem senha gerada automaticamente.

Botão final: "Criar Empresa + Admin". O modal de credenciais continua, mostrando o email e a senha digitada.  
  
E deve ter a Opção de "ENVIAR ACESSO", enviando pelo WhatsApp o "Nome do Admin", "Email do Admin" e "Senha do Admin".

## Detalhes técnicos

- `git mv`-equivalente: renomear rota para `src/routes/master/novaempresa.tsx`; `novaAcademia.tsx` vira rota com `beforeLoad` redirect para `/master/novaempresa`. Atualizar `sidebar-master.tsx` e `listaAcademias.tsx`.
- Migração: `academy.data_vencimento date` (nullable). `tipo_empresa`, `documento_tipo`, `documento`, `cnpj`, `whatsapp` já existem e passam a ser preenchidos.
- `createAcademiaWithOwner` (zod): remove `capacidade_max`, `mensalidade_basica`, `dia_vencimento`; adiciona `tipo_empresa` (enum business_type), `documento` opcional validado com `isValidCPF/isValidCNPJ`, `valores: [{valor, cobranca}]`, `whatsapp_ddi`, `data_vencimento`, `senha_admin` com regex de força (validada no cliente e no servidor). Insere linhas em `plan` (duration_months 1/3/6/12) após criar a academia. Usa a senha informada; `must_change_password = false`.
- Label "Academia de Musculação" em `BUSINESS_TYPES`; nova função `isStrongPassword` em `src/lib/` com teste unitário (regras de senha) e teste de mapeamento cobrança→meses.
- Datepicker shadcn (Calendar + Popover, locale pt-BR).