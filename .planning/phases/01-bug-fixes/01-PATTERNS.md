# Phase 1: Bug Fixes - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 7 (5 modified + 2 i18n files with new keys + 1 page with content expansion)
**Analogs found:** 7 / 7

---

## File Classification

| Arquivo Modificado                                    | Role                    | Data Flow        | Analog Mais Próximo                                                          | Match Quality |
| ----------------------------------------------------- | ----------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------- |
| `src/_shared/utils/validators.ts`                     | utility                 | transform        | `src/_shared/utils/validators.ts` (próprio arquivo, troca de regex)          | exact         |
| `src/_shared/utils/validators.test.ts`                | test                    | transform        | `src/_shared/utils/validators.test.ts` (próprio arquivo, troca de asserções) | exact         |
| `src/_modules/admin/admin.query.ts`                   | query (data-access)     | CRUD             | `src/_modules/admin/admin.query.ts` (próprio arquivo, remoção de param)      | exact         |
| `src/app/[locale]/(admin)/admin/report/page.tsx`      | page (Server Component) | request-response | `src/app/[locale]/(admin)/admin/page.tsx` (caller idêntico)                  | exact         |
| `src/app/[locale]/(admin)/admin/page.tsx`             | page (Server Component) | request-response | `src/app/[locale]/(admin)/admin/report/page.tsx` (caller idêntico)           | exact         |
| `src/app/[locale]/(public)/terms-of-service/page.tsx` | page (Server Component) | request-response | `src/app/[locale]/(public)/privacy-policy/page.tsx`                          | exact         |
| `messages/{pt-BR,en,es}.json`                         | config (i18n)           | transform        | `messages/pt-BR.json` — seção `Compliance.privacy` existente                 | exact         |
| `src/_actions/admin/report.action.ts`                 | action                  | request-response | `src/_actions/admin/report.action.ts` (próprio arquivo, remoção de bloco)    | exact         |

---

## Pattern Assignments

### BUG-01 — `src/_shared/utils/validators.ts` (utility, transform)

**Analog:** próprio arquivo (cirurgia de regex na linha 7)

**Padrão atual (linhas 6-9) — a ser corrigido:**

```typescript
export function isValidTrackingCode(code: string): boolean {
  const codeRegex = /^RPT-[A-Z0-9]{6}$/i // ← ERRADO: formato antigo + flag /i permissiva
  return codeRegex.test(code)
}
```

**Padrão correto (copiar estrutura de `isValidEmail`, linhas 1-4):**

```typescript
export function isValidTrackingCode(code: string): boolean {
  const codeRegex = /^AP-\d{4}-[A-Z0-9]{4}$/ // sem flag /i — tracking.ts usa .toUpperCase()
  return codeRegex.test(code)
}
```

**Regra crítica:** Sem flag `/i`. O gerador em `src/_shared/utils/tracking.ts` chama `.toUpperCase()` — lowercase nunca é gerado, portanto a flag seria permissiva demais.

---

### BUG-01 — `src/_shared/utils/validators.test.ts` (test, transform)

**Analog:** próprio arquivo — estrutura `describe > it > expect` já estabelecida (linhas 1-62)

**Bloco a substituir (linhas 21-34):**

```typescript
// ANTES — remover completamente
describe('isValidTrackingCode', () => {
  it('should return true for valid tracking codes', () => {
    expect(isValidTrackingCode('RPT-ABC123')).toBe(true)
    expect(isValidTrackingCode('rpt-xyz789')).toBe(true)
  })

  it('should return false for invalid tracking codes', () => {
    expect(isValidTrackingCode('AP-2024-XXXX')).toBe(false) // This is the new format, but validator expect RPT-
    expect(isValidTrackingCode('RPT-ABC12')).toBe(false)
    expect(isValidTrackingCode('RPT-ABC1234')).toBe(false)
    expect(isValidTrackingCode('ABC123')).toBe(false)
    expect(isValidTrackingCode('')).toBe(false)
  })
})
```

**Substituir por (copiar padrão de asserções de `isValidEmail`, linhas 6-18):**

```typescript
// DEPOIS
describe('isValidTrackingCode', () => {
  it('should return true for valid tracking codes', () => {
    expect(isValidTrackingCode('AP-2024-AB12')).toBe(true)
    expect(isValidTrackingCode('AP-2026-XY9Z')).toBe(true)
    expect(isValidTrackingCode('AP-2099-ZZZZ')).toBe(true)
  })

  it('should return false for invalid tracking codes', () => {
    expect(isValidTrackingCode('RPT-ABC123')).toBe(false) // formato antigo
    expect(isValidTrackingCode('AP-2024-ABC')).toBe(false) // 3 chars (precisa de 4)
    expect(isValidTrackingCode('AP-24-ABCD')).toBe(false) // ano curto (precisa de 4 dígitos)
    expect(isValidTrackingCode('ap-2024-AB12')).toBe(false) // lowercase rejeitado
    expect(isValidTrackingCode('AP-2024-XXXX')).toBe(true) // válido (era falso erroneamente)
    expect(isValidTrackingCode('')).toBe(false)
  })
})
```

**Padrão de imports (linha 1-2) — não mudam:**

```typescript
import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidTrackingCode, isValidUUID, sanitizeInput } from './validators'
```

---

### BUG-02 — `src/_modules/admin/admin.query.ts` (query, CRUD)

**Analog:** próprio arquivo — padrão `where` object com guards `if (param)` (linhas 87-135)

**Assinatura atual com bug (linhas 87-97):**

```typescript
export async function getReportsPaginated(
  page: number = 1,
  pageSize: number = 10,
  days: number | null = 30,
  search?: string,
  status?: string,
  categoryId?: string,
  country?: string, // posição 7 — sobrescrito na linha 105 se filterCountry existir
  city?: string,
  filterCountry?: string // posição 9 — sobrescreve where.country na linha 107
)
```

**Bug exato (linhas 105-107):**

```typescript
if (country) where.country = country // linha 105 — define country
if (city) where.city = city // linha 106
if (filterCountry) where.country = filterCountry // linha 107 — silenciosamente sobrescreve linha 105
```

**Assinatura corrigida (remover `filterCountry`, manter `country` como único param de país):**

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

**Bloco where corrigido (substituir linhas 101-107):**

```typescript
if (startDate) where.createdAt = { gte: startDate }
if (search) where.trackingCode = { contains: search, mode: 'insensitive' }
if (status) where.status = status as ReportStatus
if (categoryId) where.categoryId = categoryId
if (country) where.country = country // único — sem sobrescrita
if (city) where.city = city
```

---

### BUG-02 — `src/app/[locale]/(admin)/admin/report/page.tsx` (caller 1)

**Analog:** `src/app/[locale]/(admin)/admin/page.tsx` — mesmo padrão de call

**Call atual com bug (linhas 47-57):**

```typescript
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  status,
  category,
  country, // posição 7 — URL searchParam (pode ser undefined)
  city,
  filterCountry || undefined // posição 9 — contexto SUPERVISOR (será removida)
)
```

**Call corrigida (consolidar em posição 7):**

```typescript
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  status,
  category,
  filterCountry || country || undefined, // filterCountry (SUPERVISOR) tem precedência sobre URL param
  city
)
```

**Contexto:** `filterCountry` (linha 33 do page.tsx) vem de `user.country` quando role é SUPERVISOR — tem precedência semântica sobre `country` de URL searchParam.

---

### BUG-02 — `src/app/[locale]/(admin)/admin/page.tsx` (caller 2)

**Analog:** `src/app/[locale]/(admin)/admin/report/page.tsx` — mesmo padrão

**Call atual com bug (linhas 66-76):**

```typescript
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  undefined,
  undefined,
  undefined, // posição 7 — country não usado aqui
  undefined,
  filterCountry || undefined // posição 9 — a ser movido para posição 7
)
```

**Call corrigida:**

```typescript
getReportsPaginated(
  currentPage,
  pageSize,
  days,
  search,
  undefined,
  undefined,
  filterCountry || undefined, // posição 7 — movido de posição 9
  undefined
)
```

---

### BUG-03 — `src/app/[locale]/(public)/terms-of-service/page.tsx` (page, request-response)

**Analog:** `src/app/[locale]/(public)/privacy-policy/page.tsx` — estrutura idêntica

**Observação crítica:** A página JÁ EXISTE e já tem 3 cards (Responsabilidade, Proibições, Anonimato). O trabalho é **expandir o conteúdo** adicionando cards para as seções faltantes (D-04): objeto da plataforma, LGPD/privacidade, limitação de responsabilidade, contato.

**Padrão de estrutura vigente (linhas 1-66 do terms-of-service/page.tsx):**

```typescript
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Scale, AlertTriangle, ShieldCheck, ScrollText } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'

export default function TermsOfServicePage() {
  const t = useTranslations('Compliance.terms')
  const commonT = useTranslations('Compliance')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
      {/* Hero section — não mudar */}
      <div className="mb-12 space-y-4 text-center">
        <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
          <Scale className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('intro')}</p>
      </div>

      {/* Grid de cards — adicionar novos cards aqui com mesmo padrão */}
      <div className="grid gap-8">
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldCheck className="text-primary h-5 w-5" />
              {t('responsibility')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('responsibilityDesc')}</p>
          </CardContent>
        </Card>
        {/* ... demais cards com mesmo padrão ... */}
      </div>

      {/* Back button — não mudar */}
      <div className="mt-12 flex justify-center border-t pt-8">
        <Button asChild variant="ghost" className="rounded-full px-8">
          <Link href="/">{commonT('back')}</Link>
        </Button>
      </div>
    </div>
  )
}
```

**Ícones disponíveis no arquivo atual:** `Scale`, `AlertTriangle`, `ShieldCheck`, `ScrollText`. Para novos cards, importar adicionais de `lucide-react` (ex: `FileText`, `Lock`, `Info`, `Mail`).

**Padrão de card (copiar exatamente — privacy-policy/page.tsx linhas 22-44):**

```typescript
<Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
  <CardHeader>
    <CardTitle className="flex items-center gap-3">
      <IconComponent className="text-primary h-5 w-5" />
      {t('novaChave')}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground leading-relaxed">{t('novaChaveDesc')}</p>
  </CardContent>
</Card>
```

---

### BUG-03 — `messages/{pt-BR,en,es}.json` — seção `Compliance.terms` (config, i18n)

**Analog:** `Compliance.privacy` nos três arquivos — mesma estrutura de chaves `titulo` + `tituloDesc`

**Estado atual de `Compliance.terms` (idêntico nos 3 idiomas — chaves existentes):**

```
title, intro, responsibility, responsibilityDesc (typo intencional), prohibitions, prohibitionsDesc, anonymity, anonymityDesc
```

**Chaves faltantes para D-04 (adicionar nos 3 arquivos após `anonymityDesc`):**

```
object / objectDesc        — objeto da plataforma / propósito
lgpd / lgpdDesc            — privacidade e LGPD
limitation / limitationDesc — limitação de responsabilidade
contact / contactDesc      — informações de contato
```

**Padrão de localização (copiar de `Compliance.privacy` — pt-BR.json linhas 487-496):**

```json
"terms": {
  "title": "Termos de Uso",
  "intro": "Ao utilizar o AnonProtect, você concorda com as diretrizes de uso ético da plataforma.",
  "responsibility": "Responsabilidade",
  "responsibilityDesc": "O usuário é responsável pela veracidade das informações relatadas.",
  "prohibitions": "Proibições",
  "prohibitionsDesc": "É proibido o uso da plataforma para denúncias caluniosas ou trotes.",
  "anonymity": "Garantia de Anonimato",
  "anonymityDesc": "O sistema garante o não-rastreio da origem da denúncia pelo lado do servidor.",
  "object": "...",
  "objectDesc": "...",
  "lgpd": "...",
  "lgpdDesc": "...",
  "limitation": "...",
  "limitationDesc": "...",
  "contact": "...",
  "contactDesc": "..."
}
```

**Atenção ao typo:** `responsibilityDesc` (falta um 's' em "responsibility") — o typo está **consistente** entre `page.tsx` e os 3 JSONs. NÃO corrigir o typo nesta fase para não introduzir regressão.

---

### BUG-04 — `src/_actions/admin/report.action.ts` (action, request-response)

**Analog:** `updateReportStatusAction` (linhas 8-17) — padrão correto: sem role check interno, confia no action client

**Padrão correto (linhas 8-17 — copiar estrutura):**

```typescript
export const updateReportStatusAction = supervisorActionClient
  .schema(reportStatusSchema)
  .action(async ({ parsedInput: { reportId, status }, ctx: { user } }) => {
    try {
      await adminData.updateReportStatus(reportId, status, user.id)
      return { success: true, message: 'Status atualizado com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao atualizar status')
    }
  })
```

**Estado atual com bug (linhas 106-118):**

```typescript
export const deleteReportAction = adminActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput: { reportId }, ctx: { user } }) => {
    if (user.role !== 'ADMIN') {
      // ← REMOVER linhas 109-111
      throw new ActionError('Acesso negado: Somente administradores podem excluir denúncias')
    }
    try {
      await adminData.softDeleteReport(reportId)
      return { success: true, message: 'Denúncia excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir denúncia')
    }
  })
```

**Estado correto após remoção:**

```typescript
export const deleteReportAction = adminActionClient
  .schema(deleteReportSchema)
  .action(async ({ parsedInput: { reportId } }) => {
    // ctx: { user } também removido (não mais usado)
    try {
      await adminData.softDeleteReport(reportId)
      return { success: true, message: 'Denúncia excluída com sucesso' }
    } catch (error) {
      throw new ActionError(error instanceof Error ? error.message : 'Falha ao excluir denúncia')
    }
  })
```

---

## Shared Patterns

### Action Client — Autorização por Middleware (BUG-04)

**Fonte:** `src/_shared/utils/safe-action.ts` (referência arquitetural)
**Aplica-se a:** Todos os action files
**Princípio:** O role check acontece UMA VEZ no `adminActionClient` middleware. Nunca duplicar com `if (user.role !== 'ADMIN')` dentro do handler.

### Error Handling em Actions

**Fonte:** `src/_actions/admin/report.action.ts` (linhas 13-16, padrão em todas as actions)

```typescript
try {
  await adminData.algumMetodo(...)
  return { success: true, message: 'Mensagem de sucesso' }
} catch (error) {
  throw new ActionError(error instanceof Error ? error.message : 'Mensagem de fallback')
}
```

### i18n — Chaves nos 3 Idiomas

**Fonte:** `messages/pt-BR.json`, `messages/en.json`, `messages/es.json` — `Compliance.privacy`
**Aplica-se a:** Qualquer novo texto em `terms-of-service/page.tsx`
**Regra:** Toda chave nova em `Compliance.terms` deve existir nos 3 arquivos simultaneamente antes do PR.

### Query Layer — `server-only` + Where Object

**Fonte:** `src/_modules/admin/admin.query.ts` (linhas 1, 99-107)

```typescript
import 'server-only'
// ...
const where: Prisma.ReportWhereInput = { deletedAt: null }
if (param) where.field = param // guard antes de atribuir — nunca atribuir undefined
```

---

## No Analog Found

Nenhum arquivo desta fase fica sem analog — todas as modificações são em código existente.

---

## Metadata

**Escopo de busca:** `src/_shared/utils/`, `src/_modules/admin/`, `src/_actions/admin/`, `src/app/[locale]/(public)/`, `src/app/[locale]/(admin)/admin/`, `messages/`
**Arquivos lidos:** 11
**Data de mapeamento:** 2026-06-30
