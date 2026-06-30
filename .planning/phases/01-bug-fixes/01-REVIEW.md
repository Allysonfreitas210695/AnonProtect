---
phase: 01-bug-fixes
reviewed: 2026-06-30T13:50:00-03:00
depth: standard
files_reviewed: 10
files_reviewed_list:
  - messages/en.json
  - messages/es.json
  - messages/pt-BR.json
  - src/_actions/admin/report.action.ts
  - src/app/[locale]/(admin)/admin/page.tsx
  - src/app/[locale]/(admin)/admin/report/page.tsx
  - src/app/[locale]/(public)/terms-of-service/page.tsx
  - src/_modules/admin/admin.query.ts
  - src/_shared/utils/validators.test.ts
  - src/_shared/utils/validators.ts
findings:
  critical: 3
  warning: 5
  info: 4
  total: 12
status: issues_found
---

# Fase 01: Relatório de Code Review

**Revisado:** 2026-06-30T13:50:00-03:00
**Profundidade:** standard
**Arquivos Revisados:** 10
**Status:** issues_found

## Resumo

Revisão dos arquivos da fase 01 (bug fixes): camada de ações administrativas, módulo de queries do admin, utilitários de validação e páginas do dashboard/relatórios/termos. Foram identificados três problemas críticos: vazamento de informação de erro interno para o usuário, divisão por zero na dashboard e ausência de validação de limite no array de IDs para atualização em lote. Cinco warnings cobrindo lógica frágil de SUPERVISOR scoping, `console.error` em camada de dados, coerção de tipo insegura, função `sanitizeInput` inadequada para segurança real, e ausência de chaves i18n entre locales. Quatro itens informativos de qualidade.

---

## Critical Issues

### CR-01: Mensagem de erro interno exposta ao usuário no AdminDashboard

**File:** `src/app/[locale]/(admin)/admin/page.tsx:98`
**Issue:** O bloco `catch` renderiza `error.message` diretamente em um `<pre>` visível ao usuário autenticado. Em produção isso pode vazar stack traces, nomes de tabelas Prisma, strings de conexão parciais ou outros detalhes de infraestrutura.

```tsx
// linha 97-99 — atual (INSEGURO)
<pre className="...">{error instanceof Error ? error.message : String(error)}</pre>
```

**Fix:**

```tsx
// Mostrar mensagem genérica; logar o erro real no servidor
console.error('[AdminDashboard]', error)
// ...
<pre className="...">
  {process.env.NODE_ENV === 'development'
    ? (error instanceof Error ? error.message : String(error))
    : t('errors.loadDescription')}
</pre>
```

O `console.error` já existe na linha 86; remover o detalhe do render em produção é suficiente.

---

### CR-02: Divisão por zero em percentual de departamento quando `quickStats.total === 0`

**File:** `src/app/[locale]/(admin)/admin/page.tsx:256`
**Issue:** `Math.round((dept.count / quickStats.total) * 100)` — quando não há denúncias no período selecionado, `quickStats.total` é `0`, resultando em `NaN`. O valor `NaN%` é então renderizado na barra de progresso e o `width: NaN%` quebra o estilo inline injetado.

```tsx
// linha 256 — atual
const percentage = Math.round((dept.count / quickStats.total) * 100)
```

**Fix:**

```tsx
const percentage = quickStats.total > 0 ? Math.round((dept.count / quickStats.total) * 100) : 0
```

---

### CR-03: Sem validação de tamanho do array em `batchUpdateReportStatusAction`

**File:** `src/_actions/admin/report.action.ts:84-100`
**Issue:** `batchStatusSchema` aceita `reportIds: z.array(z.string().uuid())` sem limite de tamanho. Um supervisor mal-intencionado ou uma requisição forjada pode enviar milhares de UUIDs, disparando um `UPDATE` em massa irrestrito no banco — risco de DoS e de alteração de escopo não intencional.

```ts
// linha 85 — atual
reportIds: z.array(z.string().uuid()),
```

**Fix:**

```ts
reportIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma denúncia').max(100, 'Máximo de 100 denúncias por operação'),
```

---

## Warnings

### WR-01: Filtro SUPERVISOR por país não é aplicado ao filtro manual de país em `ReportsPage`

**File:** `src/app/[locale]/(admin)/admin/report/page.tsx:54`
**Issue:** A lógica `filterCountry || country || undefined` permite que um SUPERVISOR passe `country=undefined` (sem param na URL) e depois injete um país arbitrário via query string `?country=BR`. Se `filterCountry` for definido, o OR curto-circuita corretamente — mas se `user.country` for `null` ou vazio, `filterCountry` será `undefined` e o filtro de país do usuário será bypassado. Supervisores deveriam ver apenas seu próprio país, sem exceção.

```ts
// linha 54 — atual
filterCountry || country || undefined,
```

**Fix:**

```ts
// Se for SUPERVISOR, ignorar o param country da URL; usar sempre filterCountry
user?.role === 'SUPERVISOR' ? (filterCountry ?? undefined) : (country ?? undefined),
```

---

### WR-02: `console.error` em camada de dados (`admin.query.ts`)

**File:** `src/_modules/admin/admin.query.ts:68,75`
**Issue:** `console.error` usado diretamente em vez do logger estruturado (`pino`) definido em `src/_shared/lib/logger.ts`. Viola a convenção do projeto e perde contexto estruturado (sem `reportId`, sem stack trace formatado).

```ts
// linhas 68 e 75 — atual
console.error('Failed to decrypt report description', e)
console.error('Failed to decrypt redacted report description', e)
```

**Fix:**

```ts
import { logger } from '@/_shared/lib/logger'
// ...
logger.error({ reportId: report.id, err: e }, 'Falha ao descriptografar descrição da denúncia')
logger.error(
  { reportId: report.id, err: e },
  'Falha ao descriptografar descrição redacted da denúncia'
)
```

---

### WR-03: Cast `as unknown as Promise<T[]>` suprime erros de tipo reais

**File:** `src/_modules/admin/admin.query.ts:207,212,217,222,227`
**Issue:** Sete chamadas `groupBy` usam `as unknown as Promise<InterfaceX[]>` para contornar discrepância de tipo. Se o Prisma mudar a forma do retorno após migração ou atualização de versão, o TypeScript não detectará a incompatibilidade em tempo de compilação. O cast duplo (`as unknown as`) é sinal de coerção insegura.

```ts
// exemplo — linha 207
}) as unknown as Promise<StatusGroup[]>,
```

**Fix:** Usar a tipagem gerada pelo Prisma ou um tipo utilitário compatível:

```ts
import type { Prisma } from '@/_generated/prisma'
// Prisma.ReportGroupByOutputType já existe — usar diretamente ou criar um helper tipado
// sem `as unknown`
```

Se a API do Prisma realmente exige o cast, documentar o motivo com comentário `// TODO: remover após atualização do Prisma para vX.Y`.

---

### WR-04: `sanitizeInput` inadequado como defesa de segurança

**File:** `src/_shared/utils/validators.ts:16-18`
**Issue:** A função remove apenas `<` e `>`, o que não é suficiente para prevenir XSS em contextos HTML (aspas, backticks, `javascript:`, entidades HTML ficam intactas). O nome `sanitizeInput` sugere proteção mais ampla do que realmente oferece. Se usada em contextos que envolvem renderização de HTML ou atributos, a proteção é falsa.

```ts
// atual
return input.trim().replace(/[<>]/g, '')
```

**Fix:** Ou renomear para deixar o escopo explícito (`stripHtmlAngleBrackets`), ou usar uma biblioteca de sanitização real (`DOMPurify` no cliente, `sanitize-html` no servidor) se o contexto exigir. Para o uso atual (inputs de formulário enviados a campos de texto), ao menos documentar a limitação:

```ts
/** Remove angle brackets only. NOT a full XSS sanitizer — do not use for HTML rendering. */
export function stripAngleBrackets(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
```

---

### WR-05: Chaves i18n ausentes entre locales

**File:** `messages/en.json`, `messages/es.json`, `messages/pt-BR.json`
**Issue:** Divergência de chaves detectada entre os três arquivos:

| Chave                       | pt-BR    | en       | es       |
| --------------------------- | -------- | -------- | -------- |
| `Home.subtitle`             | ausente  | presente | presente |
| `Home.trackReport`          | ausente  | presente | presente |
| `Login.description`         | ausente  | presente | presente |
| `Login.errors`              | ausente  | presente | presente |
| `Success.aiAnalysisStatus`  | presente | ausente  | ausente  |
| `Success.aiAnalysisPending` | presente | ausente  | ausente  |
| `Compliance.retention`      | presente | ausente  | ausente  |
| `Compliance.retentionDesc`  | presente | ausente  | ausente  |
| `Compliance.oldReports`     | presente | ausente  | ausente  |
| `Compliance.retentionHint`  | presente | ausente  | ausente  |
| `Compliance.bulkArchive`    | presente | ausente  | ausente  |

Chaves faltando causam `next-intl` renderizar a chave bruta (ex: `"Home.subtitle"`) ou lançar erro dependendo da configuração de `onError`.

**Fix:** Sincronizar todos os três arquivos. Chaves novas de `pt-BR` (`aiAnalysisStatus`, `aiAnalysisPending`, retenção) precisam ser adicionadas a `en.json` e `es.json`. Chaves presentes em `en`/`es` mas ausentes em `pt-BR` (`Home.subtitle`, `Home.trackReport`, `Login.description`, `Login.errors`) precisam ser adicionadas ao `pt-BR.json`.

---

## Info

### IN-01: `getReportsPaginated` é chamada duas vezes no dashboard sem paginação real

**File:** `src/app/[locale]/(admin)/admin/page.tsx:200`
**Issue:** O dashboard busca `pageSize=10` registros via `getReportsPaginated`, mas na renderização aplica `reports.slice(0, 5)`. Os outros 5 registros são buscados e descartados. Considerar buscar apenas 5 diretamente.

---

### IN-02: Magic number `8` em `getGlobalActivityLogs`

**File:** `src/app/[locale]/(admin)/admin/page.tsx:78`
**Issue:** `getGlobalActivityLogs(8, ...)` — o número `8` não tem nome. Considerar extrair como constante nomeada `DASHBOARD_ACTIVITY_LIMIT`.

---

### IN-03: Fallback hardcodado em português em componente internacionalizado

**File:** `src/app/[locale]/(admin)/admin/page.tsx:209`
**Issue:** `report.category?.name || 'Geral'` — string `'Geral'` hardcodada em PT-BR dentro de um Server Component internacionalizado. Usar `t('someKey')` ou a chave de i18n correspondente.

---

### IN-04: `TermsOfServicePage` usa `useTranslations` (hook de cliente) em Server Component

**File:** `src/app/[locale]/(public)/terms-of-service/page.tsx:1,17`
**Issue:** `useTranslations` é um hook de React Client Components. Em Next.js App Router, Server Components devem usar `getTranslations` (assíncrono) de `next-intl/server`. O código pode funcionar porque `next-intl` tem uma implementação isomórfica, mas é um anti-pattern que pode quebrar em versões futuras ou quando o componente precisar de streaming/suspense.

```ts
// atual — anti-pattern em Server Component
import { useTranslations } from 'next-intl'
export default function TermsOfServicePage() {
  const t = useTranslations('Compliance.terms')
```

**Fix:**

```ts
import { getTranslations } from 'next-intl/server'
export default async function TermsOfServicePage() {
  const t = await getTranslations('Compliance.terms')
  const commonT = await getTranslations('Compliance')
```

---

_Revisado: 2026-06-30T13:50:00-03:00_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
