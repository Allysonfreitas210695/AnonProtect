# Requirements: AnonProtect

**Definido:** 2026-06-30
**Core Value:** O denunciante deve conseguir enviar uma denúncia de forma completamente anônima e acompanhar seu andamento via código de rastreamento.

## v1 Requirements

### Bugs Críticos

- [x] **BUG-01**: Validador de código de rastreamento aceita os formatos gerados pela aplicação (`AP-YYYY-XXXX`)
- [x] **BUG-02**: Parâmetro `country` em `getReportsPaginated()` não é sobrescrito silenciosamente por `filterCountry`
- [x] **BUG-03**: Página `/terms-of-service` existe e não retorna 404
- [x] **BUG-04**: `deleteReportAction` não possui verificação de role duplicada com o client `adminActionClient`

### Segurança

- [ ] **SEC-01**: Auto-registro público cria apenas contas `SUPERVISOR` mediante convite de um `ADMIN` — registro direto como SUPERVISOR sem autorização é bloqueado
- [ ] **SEC-02**: `sendMessageAction` valida que o `code` de rastreamento fornecido pertence ao `reportId` antes de criar a mensagem
- [x] **SEC-03**: `Message.content` é criptografado com AES-256-GCM antes de ser persistido no banco de dados
- [x] **SEC-04**: `InvestigationNote.content` é criptografado com AES-256-GCM antes de ser persistido no banco de dados
- [ ] **SEC-05**: `verifyTurnstile()` rejeita requisições quando `TURNSTILE_SECRET_KEY` está ausente, em vez de retornar `true` silenciosamente
- [ ] **SEC-06**: Rate limiting usa apenas o primeiro IP de `x-forwarded-for` (antes do primeiro `,`) como chave de limitação

### Chat — Denunciante

- [ ] **CHAT-01**: Denunciante acessa thread de mensagens do seu relatório informando o código de rastreamento na página de acompanhamento
- [ ] **CHAT-02**: Denunciante pode enviar nova mensagem na thread do seu relatório
- [ ] **CHAT-03**: Denunciante visualiza todas as mensagens da thread (suas e as do admin) em ordem cronológica
- [ ] **CHAT-04**: Thread de mensagens exibe mais de 50 mensagens com paginação quando necessário

### Chat — Admin / Supervisor

- [ ] **CHAT-05**: Admin/supervisor visualiza thread de mensagens completa no detalhe do relatório
- [ ] **CHAT-06**: Admin/supervisor pode enviar nova mensagem na thread de um relatório
- [ ] **CHAT-07**: Admin/supervisor recebe notificação por email (AWS SES) quando o denunciante envia uma nova mensagem

### Recuperação de Senha

- [ ] **AUTH-01**: Usuário que solicita recuperação de senha recebe um email real com link de reset (via AWS SES)
- [ ] **AUTH-02**: Link de reset contém token de tempo limitado (expiração configurável, padrão 1h) armazenado de forma segura
- [ ] **AUTH-03**: Usuário que clica no link válido pode definir uma nova senha
- [ ] **AUTH-04**: Token de reset é invalidado após uso único

### Performance e Qualidade

- [ ] **PERF-01**: JWT não realiza query no banco de dados a cada requisição autenticada — `role` e `country` são cacheados no token
- [ ] **PERF-02**: `getPublicStats()` usa agregação SQL (`date_trunc` + `GROUP BY`) em vez de carregar todos os timestamps em memória
- [ ] **QUAL-01**: `generateTrackingCode()` usa `crypto.randomBytes()` (CSPRNG) e verifica unicidade com retry antes de inserir no banco
- [ ] **QUAL-02**: Nenhuma chamada a `console.error`, `console.warn` ou `console.log` existe no código de produção — todos substituídos por `logger` (pino)
- [ ] **QUAL-03**: Campo `Report.priority` é um enum Prisma `ReportPriority` (`LOW | MEDIUM | HIGH | CRITICAL`) com constraint no banco
- [ ] **QUAL-04**: Falha de descriptografia retorna sentinela `[DECRYPT_FAILED]` visível na UI em vez de ciphertext bruto

## v2 Requirements

### Chat em tempo real

- **RT-01**: Mensagens aparecem na UI sem necessidade de refresh manual (WebSocket ou SSE)
- **RT-02**: Indicador de status "online/offline" para admin na thread de chat

### Notificações expandidas

- **NOTF-01**: Denunciante recebe email quando admin responde (requer coleta de email opcional e consentimento LGPD)
- **NOTF-02**: Admin recebe notificação in-app (badge/toast) quando nova mensagem chega sem precisar de email

### Exportação e relatórios

- **EXP-01**: Admin pode exportar relatório individual como PDF
- **EXP-02**: Admin pode exportar lista filtrada de relatórios como CSV

## Out of Scope

| Feature                          | Motivo                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| Aplicativo mobile                | TCC focado em plataforma web                                               |
| WebSocket / SSE em tempo real    | Complexidade adicional sem impacto na defesa — polling suficiente          |
| Provedores OAuth além de Google  | Credentials + Google já cobre o necessário                                 |
| Multi-tenant / multi-organização | Projeto de escopo único                                                    |
| Exportação PDF/Excel             | Não solicitado, fora do prazo de 1-2 semanas                               |
| 2FA / MFA                        | Fora do escopo do TCC                                                      |
| Chat com múltiplos participantes | Um denunciante ↔ admin; múltiplos admins podem responder mas não há "sala" |

## Traceability

| Requisito | Fase    | Status   |
| --------- | ------- | -------- |
| BUG-01    | Phase 1 | Complete |
| BUG-02    | Phase 1 | Complete |
| BUG-03    | Phase 1 | Complete |
| BUG-04    | Phase 1 | Complete |
| SEC-01    | Phase 2 | Pending  |
| SEC-02    | Phase 2 | Pending  |
| SEC-03    | Phase 2 | Complete |
| SEC-04    | Phase 2 | Complete |
| SEC-05    | Phase 2 | Pending  |
| SEC-06    | Phase 2 | Pending  |
| CHAT-01   | Phase 3 | Pending  |
| CHAT-02   | Phase 3 | Pending  |
| CHAT-03   | Phase 3 | Pending  |
| CHAT-04   | Phase 3 | Pending  |
| CHAT-05   | Phase 3 | Pending  |
| CHAT-06   | Phase 3 | Pending  |
| CHAT-07   | Phase 3 | Pending  |
| AUTH-01   | Phase 4 | Pending  |
| AUTH-02   | Phase 4 | Pending  |
| AUTH-03   | Phase 4 | Pending  |
| AUTH-04   | Phase 4 | Pending  |
| PERF-01   | Phase 5 | Pending  |
| PERF-02   | Phase 5 | Pending  |
| QUAL-01   | Phase 5 | Pending  |
| QUAL-02   | Phase 5 | Pending  |
| QUAL-03   | Phase 5 | Pending  |
| QUAL-04   | Phase 5 | Pending  |

**Cobertura:**

- Requisitos v1: 27 total
- Mapeados para fases: 27
- Não mapeados: 0 ✓

---

_Requisitos definidos: 2026-06-30_
_Última atualização: 2026-06-30 após definição inicial_
