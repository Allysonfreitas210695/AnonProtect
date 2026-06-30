# AnonProtect

## What This Is

AnonProtect é uma plataforma de denúncias anônimas desenvolvida como Trabalho de Conclusão de Curso (TCC). Permite que denunciantes enviem relatos anônimos via código de rastreamento, enquanto administradores e supervisores gerenciam os casos em um painel protegido por RBAC, com análise automática por IA (Google Gemini) e criptografia de dados sensíveis (AES-256-GCM).

## Core Value

O denunciante deve conseguir enviar uma denúncia de forma completamente anônima e acompanhar seu andamento via código de rastreamento — se qualquer outra coisa falhar, esse fluxo deve funcionar.

## Requirements

### Validated

<!-- O que o codebase já implementa e está funcionando -->

- ✓ Denunciante envia relatório anônimo com código de rastreamento gerado — existente
- ✓ Proteção bot via Cloudflare Turnstile no fluxo público — existente
- ✓ Rate limiting por IP (10 req/hora via Upstash Redis) — existente
- ✓ Criptografia AES-256-GCM aplicada à descrição do relatório em repouso — existente
- ✓ Análise automática por IA (Gemini 2.5 Flash): categoria, prioridade, redação LGPD — existente
- ✓ Painel administrativo protegido por NextAuth JWT + RBAC (ADMIN/SUPERVISOR) — existente
- ✓ Gerenciamento de status de relatório pelos admins — existente
- ✓ Upload de anexos via AWS S3 com URL pré-assinada — existente
- ✓ i18n com suporte a pt-BR, en e es — existente
- ✓ Autenticação via Credentials + Google OAuth — existente
- ✓ Página pública de transparência com estatísticas — existente
- ✓ Log de auditoria de ações administrativas — existente
- ✓ Gerenciamento de categorias e departamentos — existente
- ✓ Docker multi-stage + docker-compose para desenvolvimento local — existente

### Active

<!-- Melhorias e features a implementar para o TCC -->

**Bloco 1 — Bugs**

- [ ] Corrigir mismatch entre gerador (`AP-YYYY-XXXX`) e validador (`RPT-[A-Z0-9]{6}`) de código de rastreamento
- [ ] Corrigir sobrescrita silenciosa do parâmetro `country` em `getReportsPaginated()`
- [ ] Criar página `/terms-of-service` (link quebrado no fluxo de cadastro)
- [ ] Remover verificação de role redundante em `deleteReportAction`

**Bloco 2 — Segurança**

- [ ] Bloquear auto-registro de SUPERVISOR — exigir convite/aprovação de ADMIN
- [ ] Validar que o `code` de rastreamento pertence ao `reportId` antes de criar mensagem
- [ ] Criptografar `Message.content` e `InvestigationNote.content` (consistência com `Report.description`)
- [ ] Corrigir bypass do Turnstile quando `TURNSTILE_SECRET_KEY` não está definida
- [ ] Corrigir parsing de `x-forwarded-for` para usar apenas o primeiro IP da lista

**Bloco 3 — Chat Completo**

- [ ] UI de chat para o denunciante: enviar e receber mensagens via código de rastreamento
- [ ] UI de chat para admin/supervisor: responder mensagens no detalhe do relatório
- [ ] Paginação de mensagens (remover hard-cap de 50)
- [ ] Notificação por email via AWS SES quando nova mensagem é recebida

**Bloco 4 — Recuperação de Senha**

- [ ] Implementar geração e envio de token de reset por email (AWS SES)
- [ ] Implementar validação do token e redefinição da senha

**Bloco 5 — Performance e Qualidade**

- [ ] Cachear `role` e `country` no JWT em vez de query no banco a cada requisição autenticada
- [ ] Mover agregação de `getPublicStats()` para SQL (`date_trunc` + `GROUP BY`)
- [ ] Substituir `Math.random()` por CSPRNG com verificação de colisão em `generateTrackingCode()`
- [ ] Substituir todos `console.*` por `logger` (pino) no código de produção
- [ ] Converter campo `priority` de `String?` para enum Prisma `ReportPriority`
- [ ] Adicionar sentinela `[DECRYPT_FAILED]` quando descriptografia falha (em vez de retornar ciphertext silenciosamente)

### Out of Scope

- Aplicativo mobile — TCC focado em plataforma web
- WebSocket / real-time push — polling ou SSE suficiente para o caso de uso de TCC
- Provedores de identidade além de Credentials + Google OAuth — já cobre o necessário
- Multi-tenant / multi-organização — projeto de escopo único
- Exportação de relatórios para PDF/Excel — não foi solicitado

## Context

**Projeto acadêmico:** TCC com apresentação/defesa oral. Banca vê o sistema rodando — visual, funcionalidade e coerência técnica contam. O código também pode ser avaliado.

**Codebase existente:** Next.js 16 App Router, React 19, Prisma 7, NextAuth v5 beta, Zod v4, next-safe-action 8. Arquitetura em camadas rígida: pages → hooks → Server Actions → modules (query/data) → shared libs → serviços externos.

**Modelo `Message` já existe no banco** (`prisma/schema.prisma`) com relação a `Report`. A ação `sendMessageAction` existe em `src/_actions/public/message.action.ts`. O que falta é a UI completa e a criptografia das mensagens.

**AWS SES está integrado** (`src/_shared/lib/aws.ts`) mas não usado para envio real de emails — apenas definido. A infraestrutura de envio precisa ser ativada para recuperação de senha e notificações de chat.

**LGPD:** Descrições de relatórios são criptografadas e redação PII é feita pela IA antes de armazenamento. Mensagens e notas de investigação ainda não são criptografadas — inconsistência de segurança a corrigir.

**Prazo:** 1-2 semanas.

## Constraints

- **Stack:** Next.js 16 App Router — manter arquitetura existente (Server Actions, safe-action, módulos query/data)
- **Banco de dados:** PostgreSQL via Prisma — sem mudanças de ORM
- **Criptografia:** Usar `src/_shared/lib/crypto.ts` (AES-256-GCM) existente para novos campos criptografados
- **i18n:** Qualquer texto visível ao usuário precisa estar nos três arquivos `messages/*.json`
- **Prazo:** 1-2 semanas — focar em funcionalidade e segurança, não em perfeição
- **Commit:** Seguir Conventional Commits (enforced por commitlint + husky)

## Key Decisions

| Decision                                                    | Rationale                                               | Outcome   |
| ----------------------------------------------------------- | ------------------------------------------------------- | --------- |
| Manter arquitetura de camadas existente para novas features | Consistência e não quebrar o que já funciona            | — Pending |
| Chat sem WebSocket (polling ou SSE)                         | Simplicidade para TCC, evita infraestrutura adicional   | — Pending |
| Usar AWS SES existente para emails                          | Já integrado, evita nova dependência                    | — Pending |
| Bloquear registro de SUPERVISOR (não remover rota)          | Permitir criação via ADMIN mantém o fluxo de onboarding | — Pending |

## Evolution

Este documento evolui a cada transição de fase e marco de milestone.

**Após cada fase** (via `/gsd-transition`):

1. Requisitos invalidados? → Mover para Out of Scope com motivo
2. Requisitos entregues? → Mover para Validated com referência da fase
3. Novos requisitos emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se divergiu

**Após cada milestone** (via `/gsd-complete-milestone`):

1. Revisão completa de todas as seções
2. Core Value ainda é a prioridade certa?
3. Audit Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---

_Last updated: 2026-06-30 após inicialização_
