# Phase 2: Security Hardening - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Fechar todas as brechas de segurança conhecidas antes do sistema processar dados reais: bloquear auto-registro de SUPERVISOR, validar ownership de mensagens, criptografar campos sensíveis (Message.content e InvestigationNote.content), e corrigir dois bypasses por configuração ausente (Turnstile e rate limiting). Nenhuma nova funcionalidade é adicionada — apenas hardening das funções existentes.

</domain>

<decisions>
## Implementation Decisions

### SEC-01: Bloqueio de Auto-registro de SUPERVISOR

- **D-01:** Desabilitar completamente a rota `/register` — `proxy.ts` redireciona qualquer acesso a `/register` para `/login`. Nenhuma nova conta pode ser criada publicamente.
- **D-02:** Novos SUPERVISORs são criados exclusivamente via `prisma db seed` ou Prisma Studio — sem UI de gerenciamento de usuários (fora de escopo do TCC).
- **D-03:** Remover o link "Criar conta" da página de login (`src/app/[locale]/(auth)/login/`) completamente — não substituir por modal ou tooltip.
- **D-04:** Bloquear auto-criação via Google OAuth: adicionar verificação no callback `signIn` de `src/_shared/lib/auth.ts` — retornar `false` quando o usuário não existe no banco. Resultado: NextAuth redireciona para `/auth/error?error=AccessDenied`.

### SEC-03/04: Criptografia de Messages e InvestigationNotes

- **D-05:** Usar `encrypt()` de `src/_shared/lib/crypto.ts` (AES-256-GCM) em `createMessage()` e `createInvestigationNote()` — mesma função já usada para `Report.description`.
- **D-06:** Decrypt na leitura segue o padrão estabelecido em `src/_modules/report/report.query.ts`: decrypt acontece nos arquivos `*.query.ts` (report.query.ts para messages, admin.query.ts para InvestigationNotes). Callers recebem plaintext transparentemente.
- **D-07:** Falha de decrypt retorna a string sentinela `'[DECRYPT_FAILED]'` e loga com `logger.warn` — consistente com o requisito QUAL-04 da Fase 5 e com o padrão de logger (pino) em vez de `console.warn`.
- **D-08:** Dados históricos (Messages/InvestigationNotes existentes no banco) são ignorados — o banco do TCC será reiniciado antes da apresentação. Sem script de migração.
- **D-09:** `prisma/seed.ts` deve ser atualizado para usar `encrypt()` em qualquer `Message.content` ou `InvestigationNote.content` que criar, garantindo consistência pós-criptografia.

### Claude's Discretion

- **SEC-02:** Implementação exata da validação de ownership em `sendMessageAction` — buscar o relatório por `reportId` e verificar se `report.trackingCode === code`. Retornar `ActionError` genérico se não bater (sem vazar informação sobre qual campo falhou).
- **SEC-05:** Mudar linha 14 de `src/_actions/public/report.action.ts` de `return true` para `return false` quando `TURNSTILE_SECRET_KEY` ausente. Atualizar o teste correspondente.
- **SEC-06:** Mudar linha 32 de `src/_actions/public/report.action.ts` para `ip.split(',')[0].trim()` antes de passar para `checkRateLimit`.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Arquivos-alvo (SEC-01)

- `src/_actions/public/register.action.ts` — action a remover/desabilitar (hardcoda `role: 'SUPERVISOR'`)
- `src/proxy.ts` — adicionar redirect de `/register` → `/login` no middleware
- `src/_shared/lib/auth.ts` — adicionar verificação de existência de usuário no callback `signIn` (Google OAuth)
- `src/app/[locale]/(auth)/login/` — remover link para `/register`

### Arquivos-alvo (SEC-02)

- `src/_actions/public/message.action.ts` — adicionar validação de ownership (`code` pertence a `reportId`)
- `src/_modules/report/report.query.ts` ou `report.data.ts` — verificar se existe query para buscar report por ID e validar trackingCode

### Arquivos-alvo (SEC-03/04 — write)

- `src/_modules/report/report.data.ts` — `createMessage()`: adicionar `encrypt(content)` antes de persistir
- `src/_modules/admin/admin.data.ts` — `createInvestigationNote()`: adicionar `encrypt(content)` antes de persistir

### Arquivos-alvo (SEC-03/04 — read)

- `src/_modules/report/report.query.ts` — adicionar `decrypt(message.content)` onde Messages são incluídas no resultado (linhas com `messages: { orderBy: ... }`)
- `src/_modules/admin/admin.query.ts` — adicionar `decrypt(note.content)` onde InvestigationNotes são retornadas

### Arquivos-alvo (SEC-05 e SEC-06)

- `src/_actions/public/report.action.ts:14` — SEC-05: `return true` → `return false`
- `src/_actions/public/report.action.ts:32` — SEC-06: usar `.split(',')[0].trim()` no x-forwarded-for

### Padrão de referência (criptografia)

- `src/_shared/lib/crypto.ts` — funções `encrypt()` e `decrypt()` a reutilizar
- `src/_modules/report/report.query.ts` — padrão de decrypt com fallback e logger.warn

### Requisitos e Roadmap

- `.planning/REQUIREMENTS.md` §Segurança (SEC-01 a SEC-06)
- `.planning/ROADMAP.md` §Phase 2

### Seed

- `prisma/seed.ts` — verificar se cria Messages/InvestigationNotes e atualizar para usar `encrypt()`

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/_shared/lib/crypto.ts` — `encrypt()` e `decrypt()` prontos, AES-256-GCM, já usado para `Report.description`
- `src/_shared/utils/safe-action.ts` — `adminActionClient` e `supervisorActionClient` como referência de bloqueio de acesso
- `src/_modules/report/report.query.ts:31-40` — padrão de decrypt-on-read com try/catch e fallback para copiar em Messages/Notes

### Established Patterns

- Encrypt-on-write em `*.data.ts`, decrypt-on-read em `*.query.ts` — padrão estabelecido por Report.description
- Erros de acesso lançam `new Error('mensagem em português')` nos middlewares do safe-action
- `logger.warn({ context }, 'mensagem')` em vez de `console.warn` para falhas não-críticas

### Integration Points

- `sendMessageAction` já recebe `reportId` e `code` — falta apenas usar os dois para validar ownership antes de criar
- Google OAuth flow passa pelo callback `signIn` em `auth.ts` — ponto único de controle para bloquear criação de novas contas
- `proxy.ts` já tem lógica de redirect para `/login` e `/register` — estender com o redirect de bloqueio

</code_context>

<specifics>
## Specific Ideas

- Para SEC-01: a mensagem de redirect em `/login?msg=registro-desabilitado` (ou equivalente) é opcional — o redirect em si é o requisito mínimo
- Para SEC-07 (falha de decrypt): usar exatamente a string `'[DECRYPT_FAILED]'` como sentinela para consistência com QUAL-04 da Fase 5

</specifics>

<deferred>
## Deferred Ideas

- UI de gerenciamento de usuários no painel admin (criar/promover SUPERVISORs via interface) — candidata a Fase 5 ou fase futura se TCC exigir
- Notificação ao admin quando um login Google bloqueado é tentado (auditoria de tentativas)

</deferred>

---

_Phase: 2-Security-Hardening_
_Context gathered: 2026-06-30_
