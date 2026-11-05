---
phase: quick-261104-vov
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/_shared/utils/tracking.ts
  - src/_shared/utils/tracking.test.ts
  - src/_shared/utils/validators.ts
  - src/_shared/utils/validators.test.ts
  - src/_shared/lib/get-client-ip.ts
  - src/_shared/lib/get-client-ip.test.ts
  - src/_shared/lib/ratelimit.ts
  - src/_actions/public/report.action.ts
  - src/_actions/public/message.action.ts
  - src/_actions/public/login.action.ts
  - src/_actions/upload/s3.action.ts
  - src/_components/shared/rate-limit-guard.tsx
  - src/app/[locale]/(auth)/report/[code]/page.tsx
  - src/_hooks/public/use-track-report.ts
autonomous: true
requirements: [ITEM-3.1, ITEM-3.2, ITEM-3.3]

must_haves:
  truths:
    - 'Tracking codes carry ~80 bits of entropy in human-readable Base32 (no ambiguous chars)'
    - 'Consulta pelo código é limitada por IP e não vaza (válido vs inválido indistinguíveis até o limite)'
    - 'IP extraction logic is centralized in a single helper used by all actions and guards'
    - 'Nenhum log grava o trackingCode (credencial) em texto claro'
  artifacts:
    - path: 'src/_shared/utils/tracking.ts'
      provides: 'generateTrackingCode em Base32 ~80 bits'
      contains: 'crypto.randomInt'
    - path: 'src/_shared/lib/get-client-ip.ts'
      provides: 'getClientIp() helper centralizado'
      contains: 'cf-connecting-ip'
    - path: 'src/_shared/lib/ratelimit.ts'
      provides: 'trackingRateLimit + checkTrackingRateLimit (fail-open)'
      contains: 'checkTrackingRateLimit'
  key_links:
    - from: 'src/app/[locale]/(auth)/report/[code]/page.tsx'
      to: 'checkTrackingRateLimit'
      via: 'rate-limit antes de getReportByCode'
      pattern: 'checkTrackingRateLimit'
    - from: 'src/_actions/public/report.action.ts'
      to: 'getClientIp'
      via: 'import do helper centralizado'
      pattern: 'getClientIp'
---

<objective>
Fortalecer o código de rastreamento — único identificador/credencial do denunciante (Item 3 do parecer da banca). Três sub-itens coesos de segurança: (3.1) elevar a entropia do código, (3.2) fechar o oráculo de enumeração na consulta pelo código com rate limit dedicado e resposta indistinguível, (3.3) remover a credencial dos logs.

Purpose: O código de rastreamento é a única credencial do denunciante anônimo. Com 16 bits é adivinhável por força bruta; a página de consulta vaza válido vs inválido; e logs gravam o código em claro.
Output: Gerador de código Base32 ~80 bits, limitador `trackingRateLimit`, helper `getClientIp()` centralizado, consulta hardened e logs limpos.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/_shared/utils/tracking.ts
@src/_shared/utils/validators.ts
@src/_shared/lib/ratelimit.ts
@src/_actions/public/report.action.ts
@src/_actions/public/message.action.ts
@src/_actions/public/login.action.ts
@src/_actions/upload/s3.action.ts
@src/_components/shared/rate-limit-guard.tsx
@src/app/[locale]/(auth)/report/[code]/page.tsx
@src/_hooks/public/use-track-report.ts

Fatos confirmados na análise:

- `prisma/schema.prisma` linha 120: `trackingCode String @unique @map("tracking_code")` — SEM `@db.VarChar`, logo o Postgres usa `text` ilimitado. NÃO é preciso migração para o novo tamanho (~27 chars). Apenas confirmar; não rodar migrate.
- IP extraction duplicada idêntica em report/message/login/s3 actions: `cf-connecting-ip` → último de `x-forwarded-for` → `127.0.0.1`. `rate-limit-guard.tsx` usa versão crua (só `x-forwarded-for`, sem cf e sem pegar o último) — inconsistente.
- Normalização atual da consulta: `use-track-report.ts` faz `.toUpperCase()` no submit; `trackSchema` regex `/^[A-Z0-9-]+$/` já barra espaços. `getReportByCode(code)` busca `where: { trackingCode: code }` sem normalizar no servidor.
- Novo formato: `AP-${year}-XXXX-XXXX-XXXX-XXXX` = 27 chars. `trackSchema` atual tem `max(12)` → precisa subir. `isValidTrackingCode` regex `/^AP-\d{4}-[A-Z0-9]{4}$/` → precisa aceitar novo formato.
  </context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1 (3.1): Elevar entropia do código de rastreamento</name>
  <files>src/_shared/utils/tracking.ts, src/_shared/utils/tracking.test.ts, src/_shared/utils/validators.ts, src/_shared/utils/validators.test.ts, src/_hooks/public/use-track-report.ts</files>
  <behavior>
    - generateTrackingCode retorna formato `AP-${year}-XXXX-XXXX-XXXX-XXXX` (27 chars): 4 blocos de 4 símbolos.
    - Cada símbolo vem do alfabeto `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (31 símbolos, sem 0/1/I/L/O) via `crypto.randomInt(ALPHABET.length)`.
    - 16 símbolos de base-31 ≈ 79 bits de entropia; 1000 códigos gerados são únicos.
    - isValidTrackingCode aceita o novo formato e rejeita o antigo `AP-2024-AB12` e lixo (`RPT-...`, minúsculas, vazio).
    - trackSchema (em use-track-report.ts) aceita código de 27 chars e continua barrando espaços/minúsculas.
  </behavior>
  <action>
    Em `tracking.ts`: definir `const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'`. Trocar `crypto.randomBytes(2).toString('hex')` por geração de 16 símbolos usando `crypto.randomInt(ALPHABET.length)` em loop, agrupando em 4 blocos de 4 separados por `-`. Retornar `AP-${year}-${bloco1}-${bloco2}-${bloco3}-${bloco4}`. Manter import de `crypto`.

    Em `validators.ts`: atualizar `isValidTrackingCode` regex para `/^AP-\d{4}-[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/` (aceita o novo formato de 4 grupos). Decidir se mantém compatibilidade com o formato antigo — como não há códigos antigos em produção relevantes além de seeds de teste, aceitar APENAS o novo formato e ajustar os testes seed/e2e conforme necessário (ver verify).

    Em `use-track-report.ts`: atualizar `trackSchema` — subir `.max(12)` para `.max(30)`, manter `.min(8)` (permite seeds curtos de teste), manter `.regex(/^[A-Z0-9-]+$/, ...)`. Mensagens em pt-BR. Preservar a normalização `.toUpperCase()` existente no `onSubmit` e `defaultValues`.

    Atualizar `tracking.test.ts`: substituir o regex antigo `^AP-${year}-[A-Z0-9]{4}$` pelo novo `^AP-${year}-[2-9A-HJ-NP-Z]{4}(-[2-9A-HJ-NP-Z]{4}){3}$`; adicionar assert de que nenhum símbolo ambíguo (0,1,I,L,O) aparece na parte aleatória; manter os testes de unicidade e de ano.

    Atualizar `validators.test.ts`: casos válidos passam a usar o novo formato (ex.: `AP-2026-ABCD-EFGH-JKMN-PQRS`); o antigo `AP-2024-AB12` vira caso inválido.

    Confirmar `prisma/schema.prisma`: `trackingCode` é `String @unique` sem `@db.VarChar` → coluna `text`, sem limite. NÃO alterar schema e NÃO rodar migrate (ver done).

  </action>
  <verify>
    <automated>npx vitest run src/_shared/utils/tracking.test.ts src/_shared/utils/validators.test.ts</automated>
  </verify>
  <done>Código gerado tem ~80 bits em Base32 sem caracteres ambíguos, formato `AP-AAAA-XXXX-XXXX-XXXX-XXXX`; validador e trackSchema aceitam o novo formato; testes verdes. Schema NÃO alterado (coluna já é `text`). Se em revisão futura decidir-se por `@db.VarChar`, a migração seria documentada e aplicada manualmente com `npx prisma migrate dev --name tracking_code_length` — NÃO executar contra produção neste plano.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2 (3.2): Rate limit dedicado na consulta + helper getClientIp centralizado</name>
  <files>src/_shared/lib/get-client-ip.ts, src/_shared/lib/get-client-ip.test.ts, src/_shared/lib/ratelimit.ts, src/app/[locale]/(auth)/report/[code]/page.tsx, src/_actions/public/report.action.ts, src/_actions/public/message.action.ts, src/_actions/public/login.action.ts, src/_actions/upload/s3.action.ts, src/_components/shared/rate-limit-guard.tsx</files>
  <behavior>
    - getClientIp(headers) retorna `cf-connecting-ip` quando presente; senão o ÚLTIMO IP de `x-forwarded-for` (trim); senão `127.0.0.1`.
    - checkTrackingRateLimit(identifier) retorna `{ success: true, ... }` quando Redis ausente (fail-open) e quando `.limit()` lança (fail-open, loga erro).
    - A página de consulta verifica o rate limit ANTES de `getReportByCode`; quando bloqueado OU código inválido, a MESMA tela é renderizada (sem distinção perceptível de status).
  </behavior>
  <action>
    Criar `src/_shared/lib/get-client-ip.ts`: `export function getClientIp(hdrs: Headers): string` replicando exatamente a lógica atual — `hdrs.get('cf-connecting-ip') || (hdrs.get('x-forwarded-for') || '').split(',').at(-1)?.trim() || '127.0.0.1'`. Sem `server-only` (usado tanto em actions quanto em RSC). Criar teste `get-client-ip.test.ts` cobrindo os três caminhos com um `Headers` mock.

    Em `ratelimit.ts`: adicionar `trackingRateLimit` seguindo o padrão existente — `Ratelimit.slidingWindow(20, '10 m')`, `analytics: false`, `prefix: 'anonprotect_tracking_ratelimit'`, guardado por `redis ?`. Adicionar `checkTrackingRateLimit(identifier)` idêntico em forma aos outros helpers (fail-open em Redis ausente e em erro, logando via `logger.error`).

    Em `report/[code]/page.tsx`: importar `getClientIp` + `checkTrackingRateLimit` + `headers` de `next/headers`. ANTES de `getReportByCode`, obter o IP e chamar `checkTrackingRateLimit(ip)`. Se bloqueado, renderizar a MESMA resposta que o caso "não encontrado" — chamar `notFound()` tanto no bloqueio quanto quando `!report`. Assim válido/inválido/bloqueado convergem para a mesma UI (404) até o limite; nunca revelar que o código existe por diferença de status. Buscar o report só depois de passar (ou após o limite não distinguir). Resultado: a ordem vira `rate limit → getReportByCode → if (bloqueado || !report) notFound()`.

    Substituir a extração de IP duplicada por `getClientIp(hdrs)` em: `report.action.ts`, `message.action.ts`, `login.action.ts`, `s3.action.ts`. Em `rate-limit-guard.tsx`, trocar `(await headers()).get('x-forwarded-for') || '127.0.0.1'` por `getClientIp(await headers())` para alinhar a lógica (cf-connecting-ip + último x-forwarded-for).

  </action>
  <verify>
    <automated>npx vitest run src/_shared/lib/get-client-ip.test.ts && npx tsc --noEmit</automated>
  </verify>
  <done>`trackingRateLimit`/`checkTrackingRateLimit` existem com prefix próprio e fail-open; `getClientIp` centraliza a lógica e é usado nas 4 actions + rate-limit-guard; a página de consulta aplica rate limit antes do fetch e devolve 404 indistinguível para inválido/bloqueado. tsc limpo.</done>
</task>

<task type="auto">
  <name>Task 3 (3.3): Remover trackingCode dos logs</name>
  <files>src/_actions/public/report.action.ts</files>
  <action>
    Em `report.action.ts`: no `logger.warn` da colisão (linha ~81), remover `trackingCode` e logar `{ attempts }` em seu lugar. No `logger.info` de sucesso (linha ~92), remover `trackingCode`, manter só `{ reportId: report.id }`. Varrer o repo por outros `logger.*` que incluam `trackingCode` (`grep -rn "logger\." src/ | grep trackingCode`) e limpar qualquer ocorrência remanescente — a análise atual só encontrou essas duas.
  </action>
  <verify>
    <automated>test $(grep -rn "logger\." src/ | grep -v '^#' | grep -c trackingCode) -eq 0</automated>
  </verify>
  <done>Nenhuma chamada de logger grava `trackingCode`; o warn de colisão loga `attempts` e o info de sucesso loga apenas `reportId`.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                            | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| whistleblower → consulta por código | Entrada não confiável (código) atravessa aqui; é a única credencial |
| cliente → server actions            | IP derivado de headers controláveis por proxy/cliente               |

## STRIDE Threat Register

| Threat ID | Category               | Component                  | Disposition | Mitigation Plan                                                                                                                                                                 |
| --------- | ---------------------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-vov-01  | Spoofing/Info          | generateTrackingCode       | mitigate    | Base32 ~80 bits via `crypto.randomInt` torna força-bruta/adivinhação inviável (Task 1)                                                                                          |
| T-vov-02  | Information Disclosure | report/[code]/page.tsx     | mitigate    | Rate limit antes do fetch + resposta 404 indistinguível válido/inválido/bloqueado fecha oráculo de enumeração (Task 2)                                                          |
| T-vov-03  | Information Disclosure | logger em report.action.ts | mitigate    | Remover credencial `trackingCode` de todos os logs (Task 3)                                                                                                                     |
| T-vov-04  | Spoofing               | getClientIp                | accept      | `x-forwarded-for`/`cf-connecting-ip` são spoofáveis sem proxy confiável; aceito — rate limit é defesa em profundidade, não autenticação; comportamento idêntico ao já existente |

</threat_model>

<verification>
- `npm test` — toda a suíte Vitest verde (inclui testes atualizados de tracking/validators e novo get-client-ip)
- `npm run lint` — sem erros
- `npx tsc --noEmit` — sem erros de tipo
- `npx prisma generate` — NÃO necessário (schema não alterado); só rodar se, em revisão, optar-se por adicionar `@db.VarChar`
- Scan manual: `grep -rn "logger\." src/ | grep trackingCode` retorna vazio
</verification>

<success_criteria>

- Código de rastreamento com ~80 bits em Base32 legível, formato `AP-AAAA-XXXX-XXXX-XXXX-XXXX`
- Validador, trackSchema e testes aceitam o novo formato; normalização (uppercase) preservada
- `trackingRateLimit` dedicado (20/10min, fail-open, prefix próprio) e consulta hardened: rate limit antes do fetch, 404 indistinguível
- `getClientIp()` único usado por report/message/login/s3 actions + rate-limit-guard
- Nenhum log grava trackingCode
- `npm test`, `npm run lint`, `npx tsc --noEmit` passam
  </success_criteria>

<output>
Create `.planning/quick/261104-vov-fortalecer-codigo-de-rastreamento-item-3/261104-vov-SUMMARY.md` when done
</output>
