---
quick_id: 261111-p2a
status: complete
date: 2026-11-11
commits: n/a (diretório sem repositório git)
---

# Quick Task 261111-p2a: Prioridade 2 — ajustes pequenos de código

## Entregue

| Item | Mudança                                                                                                                                                                                                                                                                                                                                                         | Arquivos                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 2.1  | Pré-filtro regex (e-mail, CNPJ, CPF, CEP, telefone → `[DADO PROTEGIDO]`) aplicado no servidor antes do Gemini, tanto em `analyzeReport` quanto nas mensagens do usuário no assistente                                                                                                                                                                           | `src/_shared/lib/pii-filter.ts` (+ teste), `src/_shared/lib/ai.ts`                           |
| 2.2  | Instruções em `systemInstruction`; relato entre `<relato>…</relato>` com instrução de tratá-lo como dado e tags internas neutralizadas; `temperature: 0`; Zod (enum de prioridade); `isFaithfulRedaction` exige que o texto redigido, sem as marcas, seja composto só de trechos do original pré-filtrado, na ordem. Falha → `null` → "Aguardando anonimização" | `src/_shared/lib/ai.ts`, `ai.test.ts`                                                        |
| 2.3  | `ActivityLog.report` com `onDelete: Restrict` + migration `20261111120000_restrict_activity_log_report_delete`                                                                                                                                                                                                                                                  | `prisma/schema.prisma`, migration                                                            |
| 2.4  | Conferido: `triggerAiAnalysis` já usa `after()` de `next/server`. Sem mudança                                                                                                                                                                                                                                                                                   | —                                                                                            |
| 2.5  | Todas as actions admin verificam sessão/papel. Corrigido: `ai-analysis.ts` tinha `'use server'` e expunha `triggerAiAnalysis` como endpoint público → trocado por `import 'server-only'`. Novo teste cobre as 15 safe-actions admin + `anonymizeUser`/`exportUserData` (sem sessão, papel insuficiente, nenhum acesso ao banco)                                 | `src/_actions/public/ai-analysis.ts`, `src/__tests__/integration/admin-actions-auth.spec.ts` |
| 2.8  | Sem token do Turnstile: envio bloqueado no cliente com mensagem inline (`role="alert"`) + toast. Mensagens para erro e expiração do widget; reset do widget após recusa do servidor (token é de uso único). i18n nos 3 idiomas                                                                                                                                  | `form.tsx`, `use-new-report.ts`, `messages/*.json`                                           |

## Verificação

- Vitest: 44 arquivos, 294 testes passando
- `tsc --noEmit`: ok
- ESLint: 0 erros (5 warnings preexistentes)
- `prisma validate` / `prisma generate`: ok

- Migration aplicada no Neon em 2026-11-11 (`prisma migrate deploy`; FK `confdeltype = r`)
- Gemini real: 4/4 relatos fictícios aceitos pela checagem de fidelidade; prompt injection não obedecido
- Turnstile: clique sem verificação mostra a mensagem, permanece no formulário, 0 envios ao servidor (Playwright, local)

## Extra

- `acceptAi: false` nos `defaultValues` do formulário (antes aparecia "Invalid input: expected boolean, received undefined" em inglês)

## Limitação conhecida

- 11 dígitos soltos são tratados como CPF (telefone sem formatação também é ocultado; só a contagem fica como CPF)

## Fora do escopo (Prioridade 2)

- 2.6 proteção de branch na `main` (configuração no GitHub)
- 2.7 cobertura (`vitest --coverage`) e nota de acessibilidade
