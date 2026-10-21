# Configurações: "Cadastro da Empresa" completo

## O que muda para o usuário
Na página Configurações, a aba "Academia" passa a se chamar **"Empresa"** e ganha um formulário completo, salvo no banco:

1. **Tipo de empresa** (seleção): Academia, Estúdio de Treino Personalizado, Estúdio de Treinamento Funcional, Estúdio de Pilates, Academia de Artes Marciais, Box de CrossFit.
2. **Identificação**: Nome fantasia (obrigatório), Razão social, Documento com opção **CNPJ ou CPF do proprietário** (opcional por enquanto, com máscara e validação de dígitos quando preenchido), Inscrição estadual/municipal (opcionais).
3. **Contato**: Telefone, WhatsApp, E-mail, Site, Instagram.
4. **Endereço**: CEP (preenche rua/bairro/cidade/UF automaticamente pelo ViaCEP), Rua, Número, Complemento, Bairro, Cidade, UF.
5. **Proprietário**: Nome, CPF, E-mail, Telefone.
6. **Responsável Técnico**: Nome, Registro profissional com tipo **CREF** ou **CREFITO** (CREFITO sugerido automaticamente quando o tipo é Estúdio de Pilates), Número do registro, UF do conselho. Possibilidade de cadastrar **mais de um** responsável técnico (lista com adicionar/remover).
7. **Funcionamento**: Horários de Seg–Sex, Sábado, Domingo e capacidade por aula.

Botão "Salvar" valida os campos e mostra confirmação. Os dados também aparecem no cadastro de nova academia do painel Master (campo de tipo e documento CPF/CNPJ).

## Detalhes técnicos
- Migração (aditiva, sem quebrar nada) na tabela `academy`:
  - novo enum `business_type` + coluna `tipo_empresa` (default `academia`)
  - colunas: `razao_social`, `documento_tipo` ('cnpj'|'cpf'), `documento`, `inscricao_estadual`, `inscricao_municipal`, `whatsapp`, `site`, `instagram`, `owner_cpf`. Endereço continua em `endereco` (jsonb, com complemento); horários em `business_hours`.
- Nova tabela `academy_technical_responsible` (id, academy_id → academy, nome, conselho 'CREF'|'CREFITO', numero_registro, uf, principal bool, timestamps) com GRANTs, RLS: leitura para membros da academia (`user_academy_ids()`/`is_admin()`), escrita para `user_can_manage_academy`.
- Validação com zod (CPF/CNPJ com dígito verificador, e-mail, UF 2 letras); helper em `src/lib/documento.ts` + teste unitário vitest para validação de CPF/CNPJ.
- `src/routes/app/configuracoes.tsx`: aba Empresa com seções em Cards, react-query para carregar/salvar; responsáveis técnicos salvos via insert/update/delete.
- `src/routes/master/novaAcademia.tsx` + `master-academy.functions.ts`: aceitar `tipo_empresa` e `documento_tipo`.
- Somente usuários que gerenciam a academia (dono/admin) podem editar; demais veem leitura.
