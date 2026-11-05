---
phase: quick-261105-btq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/_shared/lib/ratelimit.ts
  - src/_shared/lib/ratelimit.test.ts
  - src/_components/shared/rate-limit-guard.tsx
  - src/_components/shared/rate-limit-error.tsx
  - src/app/[locale]/(auth)/login/page.tsx
  - src/app/[locale]/(auth)/report/new/page.tsx
  - src/app/[locale]/(auth)/report/track/page.tsx
  - src/app/[locale]/(auth)/report/[code]/page.tsx
  - src/_actions/upload/s3.action.ts
  - messages/pt-BR.json
  - messages/en.json
  - messages/es.json
  - CLAUDE.md
autonomous: true
requirements: [ITEM-5.3, ITEM-4.2]

must_haves:
  truths:
    - 'Abrir /login, /report/new, /report/track ou /report/[code] repetidas vezes NUNCA consome o limitador de envio de denúncia (reportRateLimit)'
    - 'Cada finalidade consome só seu limitador: envio→report, consulta /report/[code]→tracking, login (tentativa)→login, mensagem→message, upload→upload'
    - 'O identificador passado a Ratelimit.limit() é HMAC-SHA256 hex do IP, nunca o IP em claro'
    - 'Sem RATE_LIMIT_SECRET, a chave é derivada de AUTH_SECRET com separação de domínio e um warning é logado uma única vez'
    - 'Todos os limitadores usam analytics:false'
    - 'Nenhum logger.* em src/ recebe o IP'
  artifacts:
    - path: 'src/_shared/lib/ratelimit.ts'
      provides: 'hashIdentifier helper + 5 limitadores com analytics:false'
      contains: 'createHmac'
    - path: 'src/_shared/lib/ratelimit.test.ts'
      provides: 'Testes de hash do identificador, fallback de segredo e warning único'
  key_links:
    - from: 'src/_shared/lib/ratelimit.ts check*RateLimit'
      to: 'Ratelimit.limit'
      via: 'limit(hashIdentifier(identifier))'
      pattern: "\\.limit\\(hashIdentifier\\("
    - from: 'src/app/[locale]/(auth)/report/[code]/page.tsx'
      to: 'checkTrackingRateLimit'
      via: 'chamada única por render, sem RateLimitGuard'
      pattern: 'checkTrackingRateLimit'
---

<objective>
Itens 5.3 e 4.2 do AnonProtect.
- 5.3: visualização de página não consome limite; cada finalidade usa apenas seu limitador (remove RateLimitGuard, que chamava checkRateLimit = limitador de envio de denúncia em cada render e bloqueava IPs legítimos após ~7 aberturas).
- 4.2: IP deixa de ir em claro ao Upstash (HMAC-SHA256 com RATE_LIMIT_SECRET), analytics desligado, IP removido dos logs.

Output: ratelimit.ts com hashing centralizado, guard/erro removidos, log sem IP, docs atualizadas.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@src/_shared/lib/ratelimit.ts
@src/_shared/lib/ratelimit.test.ts
@src/_shared/lib/get-client-ip.ts

Fatos verificados no planejamento:

- Callers de check*RateLimit: report.action.ts (checkRateLimit), message.action.ts (checkMessageRateLimit), login.action.ts (checkLoginRateLimit), s3.action.ts (checkUploadRateLimit), report/[code]/page.tsx (checkTrackingRateLimit), rate-limit-guard.tsx (checkRateLimit — a ser removido). A API pública (assinatura `checkX(identifier: string)`) NÃO muda, então os mocks em *.action.test.ts continuam válidos.
- A consulta por código não tem server action: use-track-report.ts apenas faz router.push(`/report/${code}`); o limite de consulta é aplicado em report/[code]/page.tsx via checkTrackingRateLimit. Nada a mudar no track-form/hook.
- RateLimitError (rate-limit-error.tsx) só é usado pelo guard; o namespace i18n "RateLimit" (messages/\*.json ~linha 319) só é usado por RateLimitError. Ambos ficam sem uso.
- Único log com IP: src/\_actions/upload/s3.action.ts:21 `logger.warn({ ip }, 'Limite de uploads atingido')`.
- system-status.ts usa `reportRateLimit` só como health check — manter export.
- Não existe .env.example no repo (não criar; não ler/editar .env). Documentar só no CLAUDE.md.
- Mock do logger em ratelimit.test.ts não tem `warn` — adicionar.
  </context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Hash HMAC do identificador + analytics:false em ratelimit.ts (4.2)</name>
  <files>src/_shared/lib/ratelimit.ts, src/_shared/lib/ratelimit.test.ts</files>
  <behavior>
    - Com Redis configurado e RATE_LIMIT_SECRET (hex de 64 chars) definido, check*RateLimit('203.0.113.7') chama mockLimit com string hex de 64 chars que NÃO contém '203.0.113.7' e é igual a createHmac('sha256', Buffer.from(secret,'hex')).update('203.0.113.7').digest('hex') (vale para os 5 check*)
    - Mesmo IP → mesmo identificador; IPs diferentes → identificadores diferentes
    - Sem RATE_LIMIT_SECRET e com AUTH_SECRET: identificador = HMAC(chave derivada, ip) onde chave = createHmac('sha256', AUTH_SECRET).update('anonprotect-ratelimit-v1').digest(); difere do HMAC com AUTH_SECRET direto; logger.warn chamado exatamente 1 vez após várias chamadas
    - RATE_LIMIT_SECRET inválido (não-hex, tamanho ímpar ou < 64 chars) é tratado como ausente (fallback + warning)
    - Sem RATE_LIMIT_SECRET nem AUTH_SECRET: ainda passa hash (não o IP) ao limit, usando chave aleatória por processo (randomBytes(32)) com warning único
    - new Ratelimit é chamado 5 vezes, todas com analytics:false (inspecionar vi.mocked(Ratelimit).mock.calls)
    - Testes existentes (fail-open, sem Redis) continuam passando
  </behavior>
  <action>
    RED: em ratelimit.test.ts, adicionar `warn: vi.fn()` ao mock do logger e escrever os testes do <behavior> (usar vi.resetModules + import dinâmico, padrão já existente; calcular esperado com node:crypto no próprio teste). Rodar e confirmar falha. Commit `test(quick-261105-btq): adicionar testes de hash do identificador do rate limit`.

    GREEN em ratelimit.ts (per decisões 4.2):
    - Importar `createHmac`, `randomBytes` de 'node:crypto'.
    - Função interna `getRateLimitKey(): Buffer` com cache em variável de módulo (lazy, calculada na primeira chamada — não no import, para os testes controlarem env). Ordem: RATE_LIMIT_SECRET válido (regex /^[0-9a-fA-F]{64,}$/ e tamanho par) → Buffer.from(hex,'hex'); senão AUTH_SECRET → createHmac('sha256', AUTH_SECRET).update('anonprotect-ratelimit-v1').digest() + logger.warn uma vez ('RATE_LIMIT_SECRET ausente ou inválido; derivando chave de AUTH_SECRET'); senão randomBytes(32) + logger.warn uma vez. Nunca logar valor de segredo nem IP.
    - Exportar `hashIdentifier(identifier: string): string` = createHmac('sha256', getRateLimitKey()).update(identifier).digest('hex').
    - Nos 5 check*: trocar `.limit(identifier)` por `.limit(hashIdentifier(identifier))`. Hash dentro do try para manter fail-open. Atualizar JSDoc do param: "IP do cliente; é transformado em HMAC antes de sair do processo".
    - analytics:false em reportRateLimit, messageRateLimit, uploadRateLimit, loginRateLimit (tracking já é false). Manter prefixes e janelas.
    - Rodar testes → verdes. Commit `feat(quick-261105-btq): aplicar HMAC ao IP e desligar analytics no rate limit`.

  </action>
  <verify>
    <automated>npx vitest run src/_shared/lib/ratelimit.test.ts && test "$(grep -c 'analytics: true' src/_shared/lib/ratelimit.ts)" = "0" && test "$(grep -c 'limit(hashIdentifier(identifier))' src/_shared/lib/ratelimit.ts)" = "5"</automated>
  </verify>
  <done>Os 5 check* passam HMAC hex ao Upstash; fallback por AUTH_SECRET com domínio 'anonprotect-ratelimit-v1' e warning único; zero `analytics: true`; testes verdes.</done>
</task>

<task type="auto">
  <name>Task 2: Remover RateLimitGuard, IP dos logs e documentar RATE_LIMIT_SECRET (5.3 + 4.2)</name>
  <files>src/app/[locale]/(auth)/login/page.tsx, src/app/[locale]/(auth)/report/new/page.tsx, src/app/[locale]/(auth)/report/track/page.tsx, src/app/[locale]/(auth)/report/[code]/page.tsx, src/_components/shared/rate-limit-guard.tsx, src/_components/shared/rate-limit-error.tsx, src/_actions/upload/s3.action.ts, messages/pt-BR.json, messages/en.json, messages/es.json, CLAUDE.md</files>
  <action>
    Per decisões 5.3:
    - IMPORTANTE: report/[code]/page.tsx foi alterado pelo quick 261105-bo7 (prop `variant` do ReportCard). Ler o arquivo ATUAL antes de editar e preservar tudo exceto o guard.
    - Em login/page.tsx, report/new/page.tsx, report/track/page.tsx e report/[code]/page.tsx: remover import de RateLimitGuard e o wrapper `<RateLimitGuard>...</RateLimitGuard>`, mantendo os filhos intactos (usar fragmento ou o elemento raiz existente). Login NÃO ganha limitador na página — o limite de login fica só em login.action.ts (já usa checkLoginRateLimit; não alterar).
    - /report/[code]: manter a única chamada `checkTrackingRateLimit(ip)` e o `notFound()` existente quando falha (não introduzir RateLimitError ali, para não criar oráculo distinto de "código inexistente").
    - Deletar src/_components/shared/rate-limit-guard.tsx e rate-limit-error.tsx (sem uso após a remoção; não há testes deles). Confirmar com grep que não há outras referências.
    - Remover o namespace "RateLimit" de messages/pt-BR.json, en.json e es.json (só era usado por RateLimitError). Garantir JSON válido (vírgulas).
    - Não alterar report.action.ts, message.action.ts, login.action.ts: já usam o limitador correto da sua finalidade.

    Per decisões 4.2:
    - s3.action.ts linha ~21: trocar `logger.warn({ ip }, 'Limite de uploads atingido')` por `logger.warn('Limite de uploads atingido')` (ou com contexto não identificador). Rodar grep em src/ por logger com ip (incluindo variações como clientIp/ipAddress) e remover qualquer outra ocorrência.
    - CLAUDE.md, linha "Required vars" (~177): adicionar `RATE_LIMIT_SECRET` (32-byte hex, 64 chars; opcional — fallback derivado de AUTH_SECRET) e, na seção "Rate Limiting", uma frase: identificadores são HMAC-SHA256 do IP (nunca IP em claro), analytics desligado, visualização de página não consome limite. Não criar .env.example; não ler/editar .env.

    Commits: `fix(quick-261105-btq): remover RateLimitGuard das paginas para nao consumir limite em visualizacao` e `fix(quick-261105-btq): remover IP dos logs e documentar RATE_LIMIT_SECRET`.

  </action>
  <verify>
    <automated>cd "/home/allyson/Área de trabalho/Faculdade/AnonProtect" && test ! -e src/_components/shared/rate-limit-guard.tsx && test ! -e src/_components/shared/rate-limit-error.tsx && test "$(grep -rn 'RateLimitGuard\|RateLimitError' src | wc -l)" = "0" && test "$(grep -rnE 'logger\.[a-z]+\(\s*\{[^}]*\bip\b' src | wc -l)" = "0" && for f in messages/*.json; do node -e "const m=require('./$f'); if(m.RateLimit) process.exit(1)" || exit 1; done && grep -q RATE_LIMIT_SECRET CLAUDE.md && npm test && npm run lint && npx tsc --noEmit</automated>
  </verify>
  <done>Nenhuma página chama limitador por visualização exceto /report/[code] (só tracking, uma vez); guard/erro e chaves i18n órfãs removidos; nenhum log com IP; RATE_LIMIT_SECRET documentado; npm test, lint e tsc passam.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                 | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| app → Upstash Redis      | identificador do cliente sai do processo para serviço terceiro |
| browser → páginas (auth) | requisições não autenticadas que antes consumiam limite        |

## STRIDE Threat Register

| Threat ID | Category               | Component                 | Disposition | Mitigation Plan                                                                                              |
| --------- | ---------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| T-btq-01  | Information Disclosure | ratelimit.ts → Upstash    | mitigate    | HMAC-SHA256(ip) com RATE_LIMIT_SECRET/derivado; analytics:false em todos                                     |
| T-btq-02  | Information Disclosure | logs (s3.action.ts)       | mitigate    | remover campo ip de todos os logger.\*                                                                       |
| T-btq-03  | Denial of Service      | RateLimitGuard em páginas | mitigate    | remover guard; cada ação usa só seu limitador                                                                |
| T-btq-04  | Information Disclosure | /report/[code] enumeração | mitigate    | manter checkTrackingRateLimit + notFound() indistinguível                                                    |
| T-btq-05  | Spoofing               | segredo ausente           | mitigate    | fallback derivado de AUTH_SECRET com separação de domínio; random por processo em último caso; nunca IP puro |

</threat_model>

<verification>
npm test, npm run lint, npx tsc --noEmit verdes; grep confirma ausência de RateLimitGuard/RateLimitError, `analytics: true` e logs com ip.
</verification>

<success_criteria>

- Visualizar páginas não consome nenhum limitador (exceto tracking em /report/[code], que é a própria consulta).
- Upstash só recebe HMAC hex; testes provam que .limit() não recebe o IP.
- Docs atualizadas; commits Conventional em português com escopo quick-261105-btq.
  </success_criteria>

<output>
Create `.planning/quick/261105-btq-5-3-limitadores-separados-e-4-2-ip-com-h/261105-btq-SUMMARY.md` when done
</output>
