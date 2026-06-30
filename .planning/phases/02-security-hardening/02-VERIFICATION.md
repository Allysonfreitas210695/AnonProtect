---
phase: 02-security-hardening
verified: 2026-06-30T18:30:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: 'Message.content e InvestigationNote.content são armazenados criptografados (AES-256-GCM) no banco de dados'
    status: failed
    reason: 'Nenhum dos dois planos executados (02-01, 02-02) implementou SEC-03 ou SEC-04. createMessage() e createInvestigationNote() armazenam content em plaintext. Query files não fazem decrypt.'
    artifacts:
      - path: 'src/_modules/report/report.data.ts'
        issue: 'createMessage() persiste content sem encrypt() — linha 59: `content` direto no prisma.message.create'
      - path: 'src/_modules/admin/admin.data.ts'
        issue: 'createInvestigationNote() persiste content sem encrypt() — linha 54: `content` direto no prisma.investigationNote.create'
      - path: 'src/_modules/report/report.query.ts'
        issue: 'Messages incluídas em getReportByTrackingCode (linha 25) não passam por decrypt()'
      - path: 'src/_modules/admin/admin.query.ts'
        issue: 'InvestigationNotes retornadas não passam por decrypt()'
    missing:
      - 'encrypt(content) em createMessage() antes do prisma.message.create'
      - 'encrypt(content) em createInvestigationNote() antes do prisma.investigationNote.create'
      - 'decrypt em loop sobre messages em report.query.ts (seguir padrão de Report.description já existente)'
      - 'decrypt em loop sobre investigationNotes em admin.query.ts'
      - 'Plano dedicado SEC-03/SEC-04 — os dois planos desta fase não cobriram esses requirements'
  - truth: 'Rate limiting usa IP Cloudflare-aware (CF-Connecting-IP primeiro, rightmost XFF como fallback) como chave de limitação'
    status: passed
    reason: 'Implementação confirmada pelo usuário como correta: CF-Connecting-IP + rightmost XFF é defensivamente superior ao simples primeiro XFF em ambiente Cloudflare. ROADMAP SC atualizado para refletir a implementação real.'
---

# Phase 02: Security Hardening — Verification Report

**Phase Goal:** Fechar 6 vulnerabilidades de segurança identificadas na análise pré-planejamento: bloqueio de auto-registro de SUPERVISOR, criptografia de campos sensíveis, validação de ownership em mensagens, e hardening de configurações de rate-limit e captcha.
**Verified:** 2026-06-30T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| #   | Truth                                                                                    | Status     | Evidence                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Usuário não pode auto-registrar como SUPERVISOR                                          | ✓ VERIFIED | proxy.ts redireciona /register; register.action.ts lança ActionError; signIn callback bloqueia Google OAuth; login sem link /register                              |
| 2   | Par code/reportId incompatível é rejeitado por sendMessageAction antes de criar mensagem | ✓ VERIFIED | message.action.ts linhas 18-25: findUnique + `if (!report \|\| report.trackingCode !== code) throw ActionError`                                                    |
| 3   | Message.content e InvestigationNote.content armazenados criptografados (AES-256-GCM)     | ✗ FAILED   | createMessage() (report.data.ts:56-62) e createInvestigationNote() (admin.data.ts:51-55) persistem content em plaintext — sem encrypt()                            |
| 4   | Omitir TURNSTILE_SECRET_KEY faz verificação Turnstile falhar, não passar silenciosamente | ✓ VERIFIED | report.action.ts linha 14: `if (!process.env.TURNSTILE_SECRET_KEY) return false`                                                                                   |
| 5   | Rate limiting usa apenas o primeiro IP de x-forwarded-for, não a string completa         | ✗ FAILED   | Implementação usa `.at(-1)` (ÚLTIMO IP) não `[0]` (primeiro); também adiciona cf-connecting-ip não mencionado no SC; SUMMARY declarou split(',')[0].trim() — falso |

**Score: 3/5 truths verified**

---

### Required Artifacts

| Artifact                                         | Expected                                                          | Status     | Details                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `src/proxy.ts`                                   | Redirect /register → /login, sem /register em isPublicRoute       | ✓ VERIFIED | Linhas 37-40: bloco de redirect antes de isPublicRoute; /register ausente da lista                         |
| `src/_shared/lib/auth.ts`                        | signIn callback bloqueia Google OAuth para emails não cadastrados | ✓ VERIFIED | Linhas 39-46: `if (account?.provider === 'google') { ... if (!existingUser) return false }`                |
| `src/_actions/public/register.action.ts`         | Lança ActionError('Registro desabilitado')                        | ✓ VERIFIED | Linha 7: `throw new ActionError('Registro desabilitado')`                                                  |
| `src/app/[locale]/(auth)/login/login-client.tsx` | Sem `href="/register"`                                            | ✓ VERIFIED | Arquivo inspecionado: nenhum link para /register; apenas forgot-password, privacy-policy, terms-of-service |
| `src/_actions/public/report.action.ts`           | Turnstile fail-closed + normalização de IP                        | ✓ PARTIAL  | Fail-closed VERIFIED (linha 14); IP usa rightmost XFF + cf-connecting-ip, não first XFF como spec          |
| `src/_actions/public/message.action.ts`          | Ownership check trackingCode/reportId antes de createMessage      | ✓ VERIFIED | Linhas 18-25: findUnique + comparação + ActionError genérico                                               |
| `src/_modules/report/report.data.ts`             | createMessage() com encrypt(content)                              | ✗ MISSING  | Linha 59: `content` persistido sem encrypt                                                                 |
| `src/_modules/admin/admin.data.ts`               | createInvestigationNote() com encrypt(content)                    | ✗ MISSING  | Linha 54: `content` persistido sem encrypt                                                                 |
| `src/_modules/report/report.query.ts`            | decrypt em messages retornadas                                    | ✗ MISSING  | Linha 25: messages incluídas sem decrypt loop                                                              |
| `src/_modules/admin/admin.query.ts`              | decrypt em investigationNotes retornadas                          | ✗ MISSING  | InvestigationNotes retornadas sem decrypt                                                                  |

---

### Key Link Verification

| From                      | To                       | Via                                                  | Status      | Details                                                                        |
| ------------------------- | ------------------------ | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| auth.ts signIn callback   | prisma.user.findUnique   | lookup por email antes de aceitar Google OAuth       | ✓ WIRED     | Linha 41: `prisma.user.findUnique({ where: { email: user.email! } })`          |
| message.action.ts         | prisma.report.findUnique | lookup por reportId comparando trackingCode === code | ✓ WIRED     | Linhas 18-25: pattern confirmado                                               |
| createMessage()           | encrypt()                | write-side encryption para SEC-03                    | ✗ NOT_WIRED | encrypt importado em report.data.ts (linha 5) mas NÃO usado em createMessage() |
| createInvestigationNote() | encrypt()                | write-side encryption para SEC-04                    | ✗ NOT_WIRED | admin.data.ts não importa encrypt; createInvestigationNote persiste plaintext  |

---

### Requirements Coverage

| Requirement | Source Plan               | Description                                            | Status      | Evidence                                                                                                                                        |
| ----------- | ------------------------- | ------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01      | 02-01-PLAN.md             | Auto-registro público de SUPERVISOR bloqueado          | ✓ SATISFIED | 4 camadas: proxy redirect, action desabilitada, signIn callback, UI sem link                                                                    |
| SEC-02      | 02-02-PLAN.md             | sendMessageAction valida ownership code/reportId       | ✓ SATISFIED | message.action.ts linhas 18-25                                                                                                                  |
| SEC-03      | (ORPHANED — nenhum plano) | Message.content criptografado AES-256-GCM              | ✗ BLOCKED   | createMessage() sem encrypt(); requirement mapeado para Phase 2 mas nenhum plano o cobriu                                                       |
| SEC-04      | (ORPHANED — nenhum plano) | InvestigationNote.content criptografado AES-256-GCM    | ✗ BLOCKED   | createInvestigationNote() sem encrypt(); requirement mapeado para Phase 2 mas nenhum plano o cobriu                                             |
| SEC-05      | 02-02-PLAN.md             | verifyTurnstile() fail-closed sem TURNSTILE_SECRET_KEY | ✓ SATISFIED | report.action.ts linha 14: `return false`                                                                                                       |
| SEC-06      | 02-02-PLAN.md             | Rate limit chaveado no primeiro IP de x-forwarded-for  | ✗ BLOCKED   | Implementação usa rightmost XFF (.at(-1)) + cf-connecting-ip; SC exige primeiro IP; SUMMARY declarou split(',')[0].trim() — código real diverge |

**Orphaned requirements (Phase 2 mapeados, não cobertos por nenhum plano):** SEC-03, SEC-04

---

### Anti-Patterns Found

| File                                  | Line   | Pattern              | Severity | Impact                                                                             |
| ------------------------------------- | ------ | -------------------- | -------- | ---------------------------------------------------------------------------------- |
| `src/_modules/report/report.query.ts` | 35     | `console.warn(...)`  | ℹ️ Info  | Pré-existente; fora do escopo desta fase, mas registrado (QUAL-02 cobre na Fase 5) |
| `src/_modules/admin/admin.query.ts`   | 68, 76 | `console.error(...)` | ℹ️ Info  | Pré-existente; idem                                                                |

Nenhum marcador TBD/FIXME/XXX nos arquivos modificados por esta fase.

---

### Behavioral Spot-Checks

| Behavior                      | Command                                                                             | Result                                                                    | Status |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| verifyTurnstile fail-closed   | `grep -n "TURNSTILE_SECRET_KEY) return false" src/_actions/public/report.action.ts` | linha 14 ✓                                                                | ✓ PASS |
| Register action bloqueada     | `grep -n "Registro desabilitado" src/_actions/public/register.action.ts`            | linha 7 ✓                                                                 | ✓ PASS |
| Ownership check presente      | `grep -n "trackingCode !== code" src/_actions/public/message.action.ts`             | linha 23 ✓                                                                | ✓ PASS |
| /register redirect no proxy   | `grep -n "startsWith('/register')" src/proxy.ts`                                    | linha 37: bloco de redirect ✓, ausente em isPublicRoute ✓                 | ✓ PASS |
| Message sem encrypt           | `grep -n "encrypt" src/_modules/report/report.data.ts`                              | encrypt importado (linha 5) mas não usado em createMessage (linhas 55-63) | ✗ FAIL |
| Note sem encrypt              | `grep -n "encrypt" src/_modules/admin/admin.data.ts`                                | encrypt não importado; createInvestigationNote plaintext (linhas 51-55)   | ✗ FAIL |
| IP normalization via split[0] | `grep -n "split.*\[0\]" src/_actions/public/report.action.ts`                       | ausente; código usa .at(-1) (linha 35)                                    | ✗ FAIL |

---

### Human Verification Required

#### 1. /register redirect com locale /es/

**Test:** Acessar `/es/register` no browser
**Expected:** Redirecionado para `/es/login`
**Why human:** O commit f69eb93 adicionou locale `es` ao regex do proxy; verificar se o redirect funciona corretamente para todos os três locales (pt-BR, en, es)

#### 2. Google OAuth bloqueado para email não cadastrado

**Test:** Tentar login Google com conta que não existe no banco de dados
**Expected:** Redirecionamento para `/auth/error?error=AccessDenied`
**Why human:** Não é possível simular o fluxo OAuth completo com grep; requer browser e conta Google real

---

### Gaps Summary

**2 blockers impedem que o phase goal seja considerado atingido:**

**Blocker 1 — SEC-03/SEC-04 não implementados (ROADMAP SC #3):**
O phase goal explicitamente menciona "criptografia de campos sensíveis" e o ROADMAP SC #3 exige que `Message.content` e `InvestigationNote.content` sejam armazenados com AES-256-GCM. Nenhum dos dois planos desta fase (02-01, 02-02) cobriu esses requirements. Os dois requirements SEC-03 e SEC-04 são orphaned — mapeados para Phase 2 em REQUIREMENTS.md mas sem plano de implementação. `createMessage()` e `createInvestigationNote()` persistem content em plaintext. O padrão de encrypt-on-write + decrypt-on-read existe no codebase (Report.description) e está documentado em CONTEXT.md (decisões D-05 a D-09), mas nunca foi executado.

**Blocker 2 — SEC-06 desvio de spec (ROADMAP SC #5):**
O SC exige "primeiro IP de x-forwarded-for". A implementação real usa `cf-connecting-ip` como prioridade e rightmost XFF (`.at(-1)`) como fallback — commit c71b10e alterou intencionalmente o algoritmo após execução do plano. O SUMMARY-02 afirmou falsamente que `split(',')[0].trim()` estava na linha 32. A implementação atual pode ser defensivamente superior em ambiente Cloudflare (cf-connecting-ip não é forjável), mas não satisfaz o texto do SC como escrito. Decisão necessária: atualizar o ROADMAP SC para refletir a implementação real, ou corrigir o código para usar primeiro XFF.

---

_Verified: 2026-06-30T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
