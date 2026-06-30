# Phase 2: Security Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 02-security-hardening
**Areas discussed:** SEC-01: Mecanismo de bloqueio de registro, SEC-03/04: Migração de dados não-criptografados, SEC-03/04: Onde descriptografar na leitura

---

## SEC-01: Mecanismo de bloqueio de registro

### Q1: Como bloquear o registerAction que hardcoda `role: 'SUPERVISOR'`?

| Option                              | Description                                                                   | Selected |
| ----------------------------------- | ----------------------------------------------------------------------------- | -------- |
| Desabilitar a rota de registro      | Rota /register deixa de existir ou redireciona. ADMINs criam via painel admin | ✓        |
| Manter rota, mudar role para USER   | Registro cria USER, ADMIN promove. Requer nova UI de promoção                 |          |
| Manter rota, bloquear completamente | Rota retorna erro genérico, ADMINs criam direto no banco                      |          |

**User's choice:** Desabilitar a rota de registro

---

### Q2: Como criar novos SUPERVISORs sem a rota de registro? (painel admin não tem página de usuários)

| Option                                                    | Description                                              | Selected |
| --------------------------------------------------------- | -------------------------------------------------------- | -------- |
| Via seed/banco de dados diretamente                       | npx prisma db seed / Prisma Studio — suficiente para TCC | ✓        |
| Criar página de gerenciamento de usuários no painel admin | Nova página /admin/users — fora do escopo da Fase 2      |          |

**User's choice:** Via seed/banco de dados diretamente

---

### Q3: O que acontece quando alguém acessa /register após desabilitação?

| Option                                | Description                             | Selected |
| ------------------------------------- | --------------------------------------- | -------- |
| Redirecionar para /login com mensagem | proxy.ts redireciona /register → /login | ✓        |
| Retornar 404                          | Deletar arquivo de rota                 |          |
| Remover link e manter rota com erro   | ActionError 'Registro desabilitado'     |          |

**User's choice:** Redirecionar para /login com mensagem

---

### Q4: Google OAuth também cria contas automaticamente — bloquear também?

| Option                       | Description                                               | Selected |
| ---------------------------- | --------------------------------------------------------- | -------- |
| Bloquear Google OAuth também | Retornar false no signIn callback quando user não existe  | ✓        |
| Manter Google OAuth aberto   | Login Google continua criando SUPERVISORs — inconsistente |          |

**User's choice:** Bloquear Google OAuth também

---

### Q5: O que retornar no signIn callback para Google OAuth bloqueado?

| Option                                      | Description                                              | Selected |
| ------------------------------------------- | -------------------------------------------------------- | -------- |
| Retornar false no callback signIn           | NextAuth redireciona para /auth/error?error=AccessDenied | ✓        |
| Redirecionar para /login?error=unauthorized | Melhor UX mas mais código                                |          |

**User's choice:** Retornar false no callback signIn

---

### Q6: O link "Criar conta" na página de login?

| Option                       | Description                                                | Selected |
| ---------------------------- | ---------------------------------------------------------- | -------- |
| Remover o link completamente | Sem confusão — link não faz sentido para rota desabilitada | ✓        |
| Manter com nota explicativa  | Modal/tooltip "contate o administrador"                    |          |

**User's choice:** Remover o link completamente

---

## SEC-03/04: Migração de dados não-criptografados

### Q1: O que fazer com Messages e InvestigationNotes existentes no banco?

| Option                             | Description                               | Selected |
| ---------------------------------- | ----------------------------------------- | -------- |
| Ignorar dados históricos           | TCC DB reiniciado antes da apresentação   | ✓        |
| Script de migração                 | Criptografar tudo no deploy               |          |
| Abordagem dual detect-then-decrypt | Tentar decrypt(), fallback para plaintext |          |

**User's choice:** Ignorar dados históricos

---

### Q2: O seed.ts deve ser atualizado para usar encrypt()?

| Option                             | Description                                        | Selected |
| ---------------------------------- | -------------------------------------------------- | -------- |
| Atualizar o seed para criptografar | Garante banco consistente para demo na defesa      | ✓        |
| Não atualizar o seed               | Dados do seed falhariam no decrypt() após ativação |          |

**User's choice:** Atualizar o seed para criptografar

---

## SEC-03/04: Onde descriptografar na leitura

### Q1: Onde implementar decrypt para Messages/Notes?

| Option                               | Description                                                 | Selected |
| ------------------------------------ | ----------------------------------------------------------- | -------- |
| Seguir padrão de report.query.ts     | Decrypt em \*.query.ts — consistente com Report.description | ✓        |
| Centralizar em helper decrypt-fields | Menos duplicação mas abstração desnecessária para TCC       |          |

**User's choice:** Seguir padrão de report.query.ts

---

### Q2: O que fazer quando decrypt falha?

| Option                                    | Description                                                     | Selected |
| ----------------------------------------- | --------------------------------------------------------------- | -------- |
| Retornar '[DECRYPT_FAILED]' + logger.warn | Consistente com QUAL-04 Fase 5, usa pino em vez de console.warn | ✓        |
| Lançar erro e deixar caller tratar        | Menos resiliente para o usuário final                           |          |
| Retornar string vazia silenciosamente     | Falha silenciosa — esconde o problema                           |          |

**User's choice:** Retornar '[DECRYPT_FAILED]' + logger.warn

---

## Claude's Discretion

- **SEC-02:** Lógica exata de validação de ownership em `sendMessageAction` — buscar report por `reportId`, comparar `trackingCode`, retornar ActionError genérico se não bater
- **SEC-05:** Mudar `return true` → `return false` na linha 14 de `report.action.ts` e atualizar teste
- **SEC-06:** Usar `.split(',')[0].trim()` no x-forwarded-for na linha 32 de `report.action.ts`

## Deferred Ideas

- UI de gerenciamento de usuários no painel admin (criar/promover SUPERVISORs via interface) — candidata a fase futura
- Notificação ao admin quando login Google bloqueado é tentado (auditoria de tentativas)
