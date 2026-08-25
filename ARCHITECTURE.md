# Arquitetura: backend desacoplado (web + futuro iOS/Android)

## Princípio

Toda regra de negócio deve viver num lugar que qualquer cliente possa chamar
da mesma forma — o app web (Next.js), um futuro app iOS (Swift) e um futuro
app Android (Kotlin). Nenhuma lógica de negócio deve existir **só** dentro do
Next.js, porque um app nativo não fala o protocolo interno dele.

## Onde cada tipo de lógica deve viver

1. **CRUD simples com regra de autorização** (quem pode ver/criar/editar o quê)
   → **RLS policies no Postgres** (já é o que fazemos: `profiles`, `cells`,
   `cell_members`). Qualquer cliente — web via `@supabase/ssr`, iOS via
   `supabase-swift`, Android via `supabase-kt` — chama a tabela diretamente e
   a regra de autorização é aplicada igual, no banco. Não precisa de uma API
   própria pra isso.

2. **Regra de negócio complexa** (cálculo, validação multi-etapa, transação
   que mexe em várias tabelas de uma vez — ex: fechar caixa de um evento,
   emitir um ingresso e debitar estoque ao mesmo tempo)
   → **Função Postgres (`security definer`) exposta via `supabase.rpc()`**.
   Fica no banco, versionada como migration, chamável identicamente por
   qualquer cliente.

3. **Integração com serviço externo que exige segredo** (gateway de
   pagamento, envio de e-mail transacional, webhook de terceiro)
   → **Supabase Edge Function** (Deno, HTTP). Não depende do Next.js/Cloudflare
   Worker rodando — é um endpoint HTTP simples, chamável de qualquer client.

4. **Server Actions do Next.js** (o que usamos hoje em `app/actions/*.ts`)
   → Tratar como **conveniência de UI para o formulário web**, nunca como o
   único lugar onde uma regra existe. Elas devem apenas chamar
   Supabase/RPC/Edge Function — a mesma chamada que o app nativo faria depois.
   Se remover o arquivo de Server Action inteiro, a regra de negócio não pode
   sumir junto.

## O que isso muda na prática pros próximos módulos

- **Loja / Bilheteria / Financeiro** vão ter regras mais complexas (estoque,
  emissão de ingresso, fechamento de caixa por evento). Essas regras nascem
  como função Postgres (`supabase.rpc()`), não como código dentro de
  `app/actions/`.
- Pagamento (cartão, Pix) é integração com segredo → Supabase Edge Function,
  nunca direto no Worker do Next.js.
- O app web sempre consome a mesma função/RPC/tabela que um app nativo
  consumiria — nunca uma rota interna exclusiva do Next.js.
