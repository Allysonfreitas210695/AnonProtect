# AnonProtect

## What This Is

AnonProtect é uma plataforma de denúncias anônimas desenvolvida como Trabalho de Conclusão de Curso (TCC). Permite que denunciantes enviem relatos anônimos via código de rastreamento e conversem com a equipe de investigação por um chat completo, enquanto administradores e supervisores gerenciam os casos em um painel protegido por RBAC, com análise automática por IA (Google Gemini), criptografia de dados sensíveis (AES-256-GCM) e recuperação de senha via AWS SES.

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
- ✓ Exportação oficial de Dossiê em PDF para relatórios administrativos — existente
- ✓ UX melhorada com Skeleton Loaders no dashboard — existente
- ✓ Upload de evidências com preview em thumbnails e remoção — existente
- ✓ Página 404 amigável para códigos de rastreio inválidos — existente
- ✓ Validador de código de rastreamento aceita o formato gerado (`AP-YYYY-XXXX`) — v1.0
- ✓ Filtro de país do painel admin respeita escopo de sessão (SUPERVISOR) sem sobrescrita silenciosa — v1.0
- ✓ Página `/terms-of-service` nos 3 locales (pt-BR, en, es) — v1.0
- ✓ `deleteReportAction` sem verificação de role redundante — v1.0
- ✓ Auto-registro público bloqueado para SUPERVISOR (apenas via convite ADMIN) — v1.0
- ✓ `sendMessageAction` valida ownership `code`/`reportId` antes de criar mensagem — v1.0
- ✓ `Message.content` e `InvestigationNote.content` criptografados com AES-256-GCM — v1.0
- ✓ Turnstile fail-closed quando `TURNSTILE_SECRET_KEY` ausente — v1.0
- ✓ Rate limiting Cloudflare-aware (`cf-connecting-ip` + rightmost XFF fallback) — v1.0
- ✓ Chat bidirecional completo (denunciante ↔ admin/supervisor), thread sem truncamento, notificação por email via AWS SES — v1.0
- ✓ Rate limiting dedicado (10 msg/min) e teto de 1000 mensagens/relatório no chat — v1.0
- ✓ Recuperação de senha via AWS SES: token CSPRNG de uso único, expiração de 1h — v1.0
- ✓ JWT cacheia `role`/`country`, sem query no banco a cada requisição autenticada — v1.0
- ✓ `getPublicStats()` usa agregação SQL (`date_trunc` + `GROUP BY`) — v1.0
- ✓ `generateTrackingCode()` usa CSPRNG (`crypto.randomBytes`) com retry de unicidade — v1.0
- ✓ `console.*` eliminado do código de produção — logger `pino` no server, shim client-safe no browser — v1.0
- ✓ `Report.priority` como enum Prisma `ReportPriority` com constraint no banco — v1.0
- ✓ Sentinela `[DECRYPT_FAILED]` em todos os caminhos de leitura (público e admin) — v1.0

### Active

<!-- Melhorias e features a implementar no próximo milestone -->

_(nenhum requisito ativo definido ainda — usar `/gsd-new-milestone` para iniciar o próximo ciclo)_

### Out of Scope

- Aplicativo mobile — TCC focado em plataforma web
- WebSocket / real-time push — polling ou SSE suficiente para o caso de uso de TCC
- Provedores de identidade além de Credentials + Google OAuth — já cobre o necessário
- Multi-tenant / multi-organização — projeto de escopo único
- Paginação de UI para thread de chat — fetch-all aceito para escala de TCC (decisão D-01, ver `.planning/milestones/v1.0-phases` se arquivado)

## Context

**Projeto acadêmico:** TCC com apresentação/defesa oral. Banca vê o sistema rodando — visual, funcionalidade e coerência técnica contam. O código também pode ser avaliado.

**Codebase v1.0:** Next.js 16 App Router, React 19, Prisma 7, NextAuth v5 beta, Zod v4, next-safe-action 8. Arquitetura em camadas rígida: pages → hooks → Server Actions → modules (query/data) → shared libs → serviços externos. ~10.100 linhas adicionadas/modificadas ao longo do milestone (95 commits desde a criação do roadmap).

**Chat completo:** `Message` model com relação a `Report`, criptografado em repouso (AES-256-GCM), thread bidirecional sem cap, notificação por email via AWS SES, rate limiting dedicado e teto de 1000 msgs/relatório.

**AWS SES ativo:** `sendEmail()` em `src/_shared/lib/aws.ts` usado para notificações de chat e recuperação de senha, com degradação graciosa quando as credenciais AWS não estão configuradas.

**LGPD:** Descrições de relatórios, mensagens e notas de investigação são criptografadas em repouso (AES-256-GCM); redação PII é feita pela IA antes de armazenamento; falha de descriptografia expõe sentinela `[DECRYPT_FAILED]` em vez de ciphertext bruto, em todos os caminhos (público e admin).

**Duas fases (4 e 5) foram implementadas manualmente fora do fluxo GSD** (commit `11a9ec5`) e depois verificadas retroativamente com `gsd-verifier`; 2 gaps reais foram encontrados (QUAL-02, QUAL-04) e fechados no mesmo dia. Rastreabilidade de requisitos (REQUIREMENTS.md) ficou dessincronizada em vários pontos após esse fluxo manual e precisou de correção manual antes do fechamento do milestone — considerar isso ao decidir entre fluxo GSD completo vs. implementação manual em milestones futuros.

**Prazo do milestone v1.0:** 1-2 semanas — cumprido.

## Constraints

- **Stack:** Next.js 16 App Router — manter arquitetura existente (Server Actions, safe-action, módulos query/data)
- **Banco de dados:** PostgreSQL via Prisma — sem mudanças de ORM
- **Criptografia:** Usar `src/_shared/lib/crypto.ts` (AES-256-GCM) existente para novos campos criptografados
- **i18n:** Qualquer texto visível ao usuário precisa estar nos três arquivos `messages/*.json`
- **Prazo:** 1-2 semanas — focar em funcionalidade e segurança, não em perfeição
- **Commit:** Seguir Conventional Commits (enforced por commitlint + husky)

## Key Decisions

| Decision                                                             | Rationale                                                               | Outcome                                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manter arquitetura de camadas existente para novas features          | Consistência e não quebrar o que já funciona                            | ✓ Good — mantida em todas as 5 fases sem retrabalho                                                                                                           |
| Chat sem WebSocket (polling ou SSE)                                  | Simplicidade para TCC, evita infraestrutura adicional                   | ✓ Good — suficiente para o caso de uso                                                                                                                        |
| Usar AWS SES existente para emails                                   | Já integrado, evita nova dependência                                    | ✓ Good — reusado em chat e recuperação de senha                                                                                                               |
| Bloquear registro de SUPERVISOR (não remover rota)                   | Permitir criação via ADMIN mantém o fluxo de onboarding                 | ✓ Good                                                                                                                                                        |
| D-01: Sem paginação de UI no chat — fetch-all aceito para escala TCC | Threads improváveis de passar de 50 mensagens em deployment de TCC      | ⚠️ Revisit — exigiu override documental de SC-4; mitigado por rate limit + cap de 1000 msgs/relatório                                                         |
| Rate limiting via `cf-connecting-ip` + rightmost XFF                 | Defensivamente superior a "apenas o primeiro IP" em ambiente Cloudflare | ✓ Good — aceito pelo usuário, SC do ROADMAP corrigido para refletir a implementação real                                                                      |
| Fases 4 e 5 implementadas manualmente, fora do fluxo GSD             | Ganho de velocidade percebido pelo desenvolvedor                        | ⚠️ Revisit — funcionou, mas exigiu verificação retroativa + correção de rastreabilidade dessincronizada; considerar manter no fluxo GSD em milestones futuros |

## Current State

**Shipped:** v1.0 MVP (2026-07-02) — 5 fases, 10 planos, 27/27 requisitos v1 completos, 148/148 testes passando, 0 erros de tipo, 0 `console.*` em código de produção. Ver `.planning/MILESTONES.md` e `.planning/milestones/v1.0-ROADMAP.md` para detalhes completos.

## Next Milestone Goals

Nenhum requisito de v1.1 definido ainda. Candidatos observados durante v1.0 (não compromissados, apenas notas para a próxima sessão de requirements):

- Paginação real de UI no chat, caso o volume de mensagens por relatório cresça além do assumido em D-01
- `getReportStats` (admin) ainda faz agregação em memória — só `getPublicStats` foi migrado para SQL em v1.0
- Configurar expiração do token de reset de senha via env var em vez de hardcoded (REQUIREMENTS.md AUTH-02 mencionava "configurável")

Rode `/gsd-new-milestone` para iniciar o próximo ciclo (questioning → research → requirements → roadmap).

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

_Last updated: 2026-07-02 após milestone v1.0_
