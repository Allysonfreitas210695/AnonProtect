---
phase: quick-260703-glj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/_shared/lib/ratelimit.ts
  - src/_shared/lib/ratelimit.test.ts
autonomous: true
requirements: [BUG-RATELIMIT-FAILOPEN]

must_haves:
  truths:
    - 'Se o Redis/Upstash estiver configurado mas inacessível (erro de rede, DNS, timeout), checkRateLimit e checkMessageRateLimit NÃO lançam exceção — retornam { success: true, ... } e o fluxo de denúncia continua funcionando'
    - 'O erro do Redis é logado (logger.error) para diagnóstico, mas nunca propaga para o caller'
    - 'Quando o Redis funciona normalmente, o comportamento de rate limiting (bloquear após N requisições) continua inalterado'
  artifacts:
    - path: 'src/_shared/lib/ratelimit.ts'
      provides: 'checkRateLimit e checkMessageRateLimit com try/catch fail-open'
      contains: 'catch'
    - path: 'src/_shared/lib/ratelimit.test.ts'
      provides: 'Cobertura de teste para o caminho de falha do Redis'
      contains: 'fail'
  key_links:
    - from: 'src/_components/shared/rate-limit-guard.tsx'
      to: 'src/_shared/lib/ratelimit.ts'
      via: 'checkRateLimit(ip)'
      pattern: 'checkRateLimit'
---

<objective>
Corrigir bug de robustez descoberto durante validação manual: `checkRateLimit`/`checkMessageRateLimit` (`src/_shared/lib/ratelimit.ts`) só degradam graciosamente quando as variáveis de ambiente do Upstash Redis estão AUSENTES. Quando as variáveis existem mas o Redis está inacessível (rede fora do ar, DNS falhando, instância deletada, timeout), a chamada `reportRateLimit.limit(identifier)` lança uma exceção não tratada que se propaga para cima — derrubando páginas inteiras (`RateLimitGuard` em `/report/new`, `/report/track`, `/report/[code]`, `/login`) com erro genérico "fetch failed".

Isso viola o Core Value do projeto: "O denunciante deve conseguir enviar uma denúncia de forma completamente anônima... se qualquer outra coisa falhar, esse fluxo deve funcionar."

Purpose: Garantir que uma falha de infraestrutura externa (Upstash) nunca derrube o fluxo primário de denúncia anônima.
Output: `checkRateLimit` e `checkMessageRateLimit` envolvidos em try/catch, logando o erro e retornando fail-open (`{ success: true, limit: 0, remaining: 0, reset: 0 }`) em caso de qualquer exceção do Redis.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/_shared/lib/ratelimit.ts
@src/_shared/lib/logger.ts
@src/_components/shared/rate-limit-guard.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fail-open em checkRateLimit e checkMessageRateLimit + testes</name>
  <files>src/_shared/lib/ratelimit.ts, src/_shared/lib/ratelimit.test.ts</files>
  <action>
Em `src/_shared/lib/ratelimit.ts`:

1. Importe o `logger` singleton de `@/_shared/lib/logger` (siga o padrão usado em outros arquivos do projeto, ex. `src/_modules/report/report.data.ts`).
2. Envolva o `await reportRateLimit.limit(identifier)` dentro de `checkRateLimit` em um try/catch. No catch, chame `logger.error({ err }, 'Rate limit check failed, failing open')` e retorne `{ success: true, limit: 0, remaining: 0, reset: 0 }` (mesmo shape do caso "sem Redis configurado").
3. Faça o mesmo para `checkMessageRateLimit` (envolvendo `await messageRateLimit.limit(identifier)`).
4. Não altere o comportamento quando `reportRateLimit`/`messageRateLimit` são `null` (env vars ausentes) — esse caminho já funciona e deve continuar igual.
5. Não altere a configuração do `Ratelimit`/`Redis` em si, nem os limites (10/hora, 10/minuto).

Se não existir `src/_shared/lib/ratelimit.test.ts`, crie um novo arquivo de teste (Vitest) cobrindo:

- `checkRateLimit` retorna `{ success: true, ... }` quando o Redis mockado lança uma exceção (simule via mock do módulo `@upstash/redis`/`@upstash/ratelimit` ou mockando `Ratelimit.prototype.limit` para rejeitar).
- `checkMessageRateLimit` tem o mesmo comportamento fail-open.
- (Se possível sem grande esforço) confirma que quando o Redis funciona normalmente, o resultado de `.limit()` é repassado sem alteração.

Siga o estilo do projeto: sem ponto-e-vírgula, aspas simples, 2 espaços, mocks com `vitest-mock-extended` ou `vi.mock` conforme padrão já usado em outros `*.test.ts` do repo (dê uma olhada em um teste existente de `_shared/lib` ou `_modules` para replicar o padrão de mock).
</action>
<verify>
<automated>npx vitest run src/\_shared/lib/ratelimit.test.ts && npm run lint && npx tsc --noEmit</automated>
</verify>
<done>checkRateLimit e checkMessageRateLimit nunca lançam exceção — qualquer erro do Redis é logado e resulta em fail-open; testes cobrem o caminho de falha; lint e typecheck passam.</done>
</task>

</tasks>

<verification>
- `npx vitest run src/_shared/lib/ratelimit.test.ts` passa, incluindo os novos casos de fail-open.
- `npm run lint` e `npx tsc --noEmit` passam.
- Revisão manual do diff: nenhuma mudança de comportamento quando Redis está saudável ou quando env vars ausentes; apenas o caminho de erro do Redis mudou.
</verification>

<success_criteria>

- Falha de rede/DNS/timeout do Upstash Redis nunca mais derruba `/report/new`, `/report/track`, `/report/[code]` ou `/login`.
- Erro é logado via `logger.error` para diagnóstico operacional.
- Comportamento de rate limiting normal (bloqueio após N requisições) inalterado quando o Redis está saudável.
  </success_criteria>

<output>
Create `.planning/quick/260703-glj-fail-open-rate-limit-quando-redis-inaces/260703-glj-SUMMARY.md` when done
</output>
