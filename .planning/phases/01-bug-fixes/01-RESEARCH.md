# Phase 1: Bug Fixes - Research

**Researched:** 2026-06-30
**Domain:** Next.js App Router — utilitários de validação, queries Prisma, rotas públicas i18n, Server Actions
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Atualizar `isValidTrackingCode()` em `src/_shared/utils/validators.ts` para aceitar o formato `AP-\d{4}-[A-Z0-9]{4}`. O generator (`tracking.ts`) não muda.
- **D-02:** Atualizar `src/_shared/utils/validators.test.ts` — remover comentário de TODO e atualizar asserções para formato AP.
- **D-03:** Consolidar em um único parâmetro `country`. Remover `filterCountry` de `getReportsPaginated()` em `admin.query.ts`. Verificar e atualizar callers.
- **D-04:** Criar página ToS com conteúdo real TCC-adequado (objeto, condições, privacidade/LGPD, limitação de responsabilidade, contato).
- **D-05:** Reutilizar layout e estrutura visual de `privacy-policy`. Não criar componentes novos.
- **D-06:** Adicionar chaves i18n nos três arquivos `messages/{pt-BR,en,es}.json` para todo texto visível.
- **D-07:** Remover bloco `if (user.role !== 'ADMIN')` interno em `deleteReportAction` (linhas 109-111 de `report.action.ts`).

### Claude's Discretion

- Ordem exata das seções do conteúdo da ToS.
- Parâmetro canônico a manter no merge do BUG-02 (`country` ou `filterCountry`) — escolher o mais semântico dado o contexto dos callers.

### Deferred Ideas (OUT OF SCOPE)

Nenhuma — discussão se manteve dentro do escopo da Fase 1.
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                | Research Support                                                                                                                |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| BUG-01 | Validador aceita formato `AP-YYYY-XXXX`                                    | Regex atual é `RPT-[A-Z0-9]{6}` — precisa ser `AP-\d{4}-[A-Z0-9]{4}`                                                            |
| BUG-02 | `country` em `getReportsPaginated()` não é sobrescrito por `filterCountry` | Linha 107 sobrescreve `where.country` definido na linha 105                                                                     |
| BUG-03 | Página `/terms-of-service` existe e não retorna 404                        | Página já existe com estrutura correta; i18n keys `Compliance.terms` têm lacunas (`responsibilityDesc` vs `responsibilityDesc`) |
| BUG-04 | `deleteReportAction` sem verificação de role duplicada                     | Linhas 109-111 repetem check que `adminActionClient` já faz                                                                     |

</phase_requirements>

---

## Summary

Esta fase corrige quatro defeitos pontuais sem introduzir nova funcionalidade. As correções são cirurgicas: uma linha de regex, remoção de um parâmetro de função + atualização de dois callers, expansão de chaves i18n para uma página que já existe com estrutura completa, e remoção de três linhas de código morto.

**Descoberta crítica sobre BUG-03:** A página `/terms-of-service` (`src/app/[locale]/(public)/terms-of-service/page.tsx`) **já existe** e já usa `useTranslations('Compliance.terms')`. O arquivo i18n `pt-BR.json` já tem as chaves `Compliance.terms.*`. A página **não retorna 404** — o conteúdo já está lá. O trabalho restante é verificar se as chaves existem nos três idiomas e se o conteúdo é adequado para banca de TCC.

**Descoberta sobre BUG-02:** O parâmetro canônico a preservar é `country` (posição 7 na assinatura). O parâmetro `filterCountry` (posição 9) deve ser removido. Ambos os callers já passam `country` como `undefined` quando filtram por `filterCountry` — logo a consolidação é remover `filterCountry` da assinatura e atualizar os callers para passar o valor no parâmetro `country`.

**Primary recommendation:** Executar as quatro correções em ordem de risco crescente: BUG-04 (remoção de código morto, zero risco) → BUG-01 (regex + teste) → BUG-02 (refatoração de assinatura) → BUG-03 (verificação/expansão i18n).

---

## Architectural Responsibility Map

| Capability                          | Primary Tier              | Secondary Tier          | Rationale                                                            |
| ----------------------------------- | ------------------------- | ----------------------- | -------------------------------------------------------------------- |
| Validação de tracking code          | Shared Utils              | —                       | Utilitário puro, sem I/O                                             |
| Filtragem de relatórios por país    | Data Access (query.ts)    | Page (Server Component) | Query é responsável pela lógica de filtro; page extrai params de URL |
| Rota pública `/terms-of-service`    | App Router (public group) | i18n (messages/)        | Rota já existe; conteúdo vive nos arquivos de tradução               |
| Autorização de `deleteReportAction` | Action Client middleware  | —                       | `adminActionClient` garante ADMIN antes do handler                   |

---

## Standard Stack

Nenhum pacote novo necessário. Todas as correções usam o stack existente.

### Ferramentas relevantes já instaladas

| Ferramenta       | Versão | Uso nesta fase                               |
| ---------------- | ------ | -------------------------------------------- |
| Vitest           | 4.0.18 | Atualização de testes de validators          |
| next-intl        | 4.8.3  | Chaves i18n para ToS                         |
| next-safe-action | 8.0.12 | `adminActionClient` (referência para BUG-04) |

---

## Package Legitimacy Audit

> Nenhum pacote externo novo instalado nesta fase.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### Sistema de Rotas Públicas (relevante para BUG-03)

```
src/app/[locale]/(public)/
├── privacy-policy/
│   └── page.tsx          ← estrutura de referência (já lida por useTranslations)
└── terms-of-service/
    └── page.tsx          ← já existe, usa Compliance.terms.*
```

Páginas públicas: Server Component, sem `_components/` locais, usa `useTranslations` do `next-intl`.

### Pattern i18n (next-intl)

```typescript
// Source: CLAUDE.md — Architecture > i18n
const t = useTranslations('Compliance.terms')
// Chaves acessadas: t('title'), t('intro'), t('responsibility'), etc.
```

Chaves devem existir nos três arquivos: `messages/pt-BR.json`, `messages/en.json`, `messages/es.json`.

### Assinatura atual vs. corrigida de `getReportsPaginated`

**Atual (com bug):**

```typescript
export async function getReportsPaginated(
  page: number = 1,
  pageSize: number = 10,
  days: number | null = 30,
  search?: string,
  status?: string,
  categoryId?: string,
  country?: string, // posição 7 — sobrescrito na linha 105
  city?: string,
  filterCountry?: string // posição 9 — sobrescreve na linha 107
)
```

**Corrigida:**

```typescript
export async function getReportsPaginated(
  page: number = 1,
  pageSize: number = 10,
  days: number | null = 30,
  search?: string,
  status?: string,
  categoryId?: string,
  country?: string, // único parâmetro de filtro por país
  city?: string
)
```

### Callers de `getReportsPaginated` e mudança necessária

**`src/app/[locale]/(admin)/admin/report/page.tsx` (linha 47-57):**

```typescript
// ANTES
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  status,
  category,
  country,
  city,
  filterCountry || undefined
)
// DEPOIS — filterCountry vira o valor do parâmetro country, já que country vem de searchParams
// Verificar lógica: se filterCountry existe, ele deve ser o filtro ativo; se country também existe, o caller precisa decidir qual tem precedência
```

**`src/app/[locale]/(admin)/admin/page.tsx` (linha 66-76):**

```typescript
// ANTES
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  undefined,
  undefined,
  undefined,
  undefined,
  filterCountry || undefined
)
// DEPOIS — mover filterCountry para posição 7 (country)
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  undefined,
  undefined,
  filterCountry || undefined,
  undefined
)
```

**Atenção em `admin/report/page.tsx`:** Este caller passa tanto `country` (de searchParams) quanto `filterCountry` — após a consolidação, o planner deve definir qual tem precedência. O `filterCountry` (sessão/contexto do admin) provavelmente tem precedência sobre `country` de URL param. Recomendação: usar `filterCountry || country || undefined` como valor do parâmetro único.

### Regex corrigida para BUG-01

```typescript
// ANTES
const codeRegex = /^RPT-[A-Z0-9]{6}$/i

// DEPOIS — [VERIFIED: tracking.ts confirma formato AP-YYYY-XXXX]
const codeRegex = /^AP-\d{4}-[A-Z0-9]{4}$/
// Sem flag /i — tracking.ts usa .toUpperCase() garantindo uppercase
```

### Chaves i18n existentes vs. necessárias para BUG-03

**`pt-BR.json` — `Compliance.terms` atual:**

```json
{
  "title": "Termos de Uso",
  "intro": "Ao utilizar o AnonProtect...",
  "responsibility": "Responsabilidade",
  "responsibilityDesc": "...",   ← ATENÇÃO: typo "responsibility" (falta um 's')
  "prohibitions": "Proibições",
  "prohibitionsDesc": "...",
  "anonymity": "Garantia de Anonimato",
  "anonymityDesc": "..."
}
```

**`page.tsx` consome:** `t('responsibility')`, `t('responsibilityDesc')`, `t('prohibitions')`, `t('prohibitionsDesc')`, `t('anonymity')`, `t('anonymityDesc')`, `t('title')`, `t('intro')`

**Status:** A página já funciona com o i18n atual. Verificar se `en.json` e `es.json` têm as mesmas chaves. Conteúdo pode precisar de expansão para ser "TCC-adequado" conforme D-04.

---

## Don't Hand-Roll

| Problema                       | Não construir                       | Usar em vez         | Motivo                                                    |
| ------------------------------ | ----------------------------------- | ------------------- | --------------------------------------------------------- |
| Autorização de role            | `if (user.role !== 'ADMIN')` manual | `adminActionClient` | Já garantido pelo middleware — código morto cria confusão |
| Validação de formato de código | Lógica condicional                  | Regex simples       | Uma expressão regular cobre todos os casos                |

---

## Common Pitfalls

### Pitfall 1: Regex case-sensitivity no BUG-01

**O que vai errado:** Usar flag `/i` na regex do tracking code permitiria `ap-2024-xxxx` em lowercase, que `tracking.ts` nunca gera (usa `.toUpperCase()`).
**Como evitar:** Remover a flag `/i` — o formato é estritamente uppercase.
**Sinal de alerta:** Teste com `ap-2024-abcd` retornando `true`.

### Pitfall 2: Caller de `admin/report/page.tsx` com dois parâmetros de país

**O que vai errado:** Após remover `filterCountry` da assinatura, o caller em `admin/report/page.tsx` passa tanto `country` (URL param) quanto `filterCountry` (contexto de sessão) — um deles será silenciosamente ignorado se não for tratado.
**Como evitar:** No caller, consolidar: `filterCountry || country || undefined` como valor único.
**Sinal de alerta:** Filtro de país do painel admin não funcionando após a correção.

### Pitfall 3: Chaves i18n faltando em `en.json` ou `es.json`

**O que vai errado:** `next-intl` lança erro em runtime se uma chave referenciada por `useTranslations` não existe no arquivo de mensagens do locale ativo.
**Como evitar:** Adicionar/verificar todas as chaves `Compliance.terms.*` nos três arquivos antes de testar.
**Sinal de alerta:** Erro de hidratação ou página em branco ao acessar `/en/terms-of-service`.

### Pitfall 4: Typo na chave `responsibilityDesc`

**O que vai errado:** `page.tsx` usa `t('responsibilityDesc')` (com typo) e `pt-BR.json` também tem o typo — consistente, portanto funciona. Mas se o conteúdo for expandido com a chave correta `responsibilityDesc`, pode quebrar.
**Como evitar:** Manter o typo existente ou corrigir simultaneamente em `page.tsx` e nos três JSONs.

---

## Code Examples

### BUG-01 — Correção de validators.ts

```typescript
// Source: src/_shared/utils/tracking.ts (formato verificado)
export function isValidTrackingCode(code: string): boolean {
  const codeRegex = /^AP-\d{4}-[A-Z0-9]{4}$/
  return codeRegex.test(code)
}
```

### BUG-01 — Correção de validators.test.ts

```typescript
describe('isValidTrackingCode', () => {
  it('should return true for valid tracking codes', () => {
    expect(isValidTrackingCode('AP-2024-AB12')).toBe(true)
    expect(isValidTrackingCode('AP-2026-XY9Z')).toBe(true)
  })

  it('should return false for invalid tracking codes', () => {
    expect(isValidTrackingCode('RPT-ABC123')).toBe(false)
    expect(isValidTrackingCode('AP-2024-ABC')).toBe(false) // 3 chars, precisa de 4
    expect(isValidTrackingCode('AP-24-ABCD')).toBe(false) // ano curto
    expect(isValidTrackingCode('ap-2024-AB12')).toBe(false) // lowercase
    expect(isValidTrackingCode('')).toBe(false)
  })
})
```

### BUG-04 — Remoção do role check redundante

```typescript
// ANTES (src/_actions/admin/report.action.ts:106-118)
export const deleteReportAction = adminActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput: { reportId }, ctx: { user } }) => {
    if (user.role !== 'ADMIN') {
      // ← REMOVER estas 3 linhas
      throw new ActionError('Acesso negado: Somente administradores podem excluir denúncias')
    }
    try {
      await adminData.softDeleteReport(reportId)
      return { success: true, message: 'Denúncia excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir denúncia')
    }
  })

// DEPOIS
export const deleteReportAction = adminActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput: { reportId } }) => {
    // ctx.user não precisa mais ser desestruturado
    try {
      await adminData.softDeleteReport(reportId)
      return { success: true, message: 'Denúncia excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir denúncia')
    }
  })
```

---

## State of the Art

Nenhuma mudança de paradigma relevante — fase usa apenas padrões já estabelecidos no projeto.

---

## Assumptions Log

| #   | Claim                                                                                   | Section            | Risco se Errado                                  |
| --- | --------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------ |
| A1  | `en.json` e `es.json` podem não ter as chaves `Compliance.terms.*`                      | Common Pitfalls #3 | Erro de runtime em locales não-PT ao acessar ToS |
| A2  | `filterCountry` em `admin/report/page.tsx` tem precedência sobre `country` de URL param | Pitfall #2         | Filtro de país ignorado após correção            |

---

## Open Questions

1. **Precedência de filtros de país em `admin/report/page.tsx`**
   - O que sabemos: o caller passa `country` (URL searchParam) E `filterCountry` (searchParam separado) — ambos podem ter valor simultaneamente.
   - O que é incerto: qual deve ter precedência quando ambos existem?
   - Recomendação: usar `filterCountry || country || undefined` (filterCountry como override de sessão).

2. **Conteúdo da ToS é suficiente para banca de TCC?**
   - O que sabemos: página já existe com 3 seções (Responsabilidade, Proibições, Anonimato).
   - O que é incerto: D-04 pede "texto genérico com seções padrão" incluindo LGPD, limitação de responsabilidade e contato — a página atual tem apenas 3 seções.
   - Recomendação: expandir o conteúdo i18n com as seções faltantes, mantendo a estrutura de cards existente.

---

## Environment Availability

Step 2.6: SKIPPED — fase é puramente code/config, sem dependências externas além das já instaladas.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`.

### Applicable ASVS Categories

| ASVS Category         | Aplica       | Controle Padrão                                                              |
| --------------------- | ------------ | ---------------------------------------------------------------------------- |
| V2 Authentication     | não          | —                                                                            |
| V3 Session Management | não          | —                                                                            |
| V4 Access Control     | sim (BUG-04) | `adminActionClient` middleware — já correto após remoção do check redundante |
| V5 Input Validation   | sim (BUG-01) | Regex `AP-\d{4}-[A-Z0-9]{4}` — validação estrita de formato                  |
| V6 Cryptography       | não          | —                                                                            |

### Threat Patterns

| Pattern                                        | STRIDE                 | Mitigação Padrão                                                                  |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| Bypass de autorização por código morto confuso | Elevation of Privilege | Remover check redundante (BUG-04) — única fonte de verdade em `adminActionClient` |
| Injeção via tracking code malformado           | Tampering              | Regex estrita sem flag `/i`, sem fallback permissivo                              |

---

## Sources

### Primary (HIGH confidence)

- `src/_shared/utils/validators.ts` — regex atual verificada por leitura direta
- `src/_shared/utils/tracking.ts` — formato `AP-${year}-${randomPart}` verificado por leitura direta
- `src/_modules/admin/admin.query.ts` — bug de parâmetros duplicados verificado linhas 94-107
- `src/_actions/admin/report.action.ts` — role check redundante verificado linhas 109-111
- `src/app/[locale]/(public)/terms-of-service/page.tsx` — página já existe, verificada por leitura direta
- `messages/pt-BR.json` — chaves `Compliance.terms.*` verificadas por leitura direta

### Secondary (MEDIUM confidence)

- Callers de `getReportsPaginated` em `admin/report/page.tsx` e `admin/page.tsx` — lidos diretamente [VERIFIED]

### Tertiary (LOW confidence)

- Conteúdo de `en.json` e `es.json` para chaves `Compliance.terms.*` — não verificado [ASSUMED: A1]

---

## Metadata

**Confidence breakdown:**

- BUG-01 (validators): HIGH — código lido diretamente, fix trivial
- BUG-02 (country filter): HIGH — bug confirmado na linha 107, callers mapeados
- BUG-03 (ToS page): HIGH (estrutura) / MEDIUM (conteúdo i18n en+es) — página existe, conteúdo pt-BR confirmado
- BUG-04 (role check): HIGH — código morto confirmado, fix é remoção pura

**Research date:** 2026-06-30
**Valid until:** 2026-07-30 (stack estável, sem dependências externas)
