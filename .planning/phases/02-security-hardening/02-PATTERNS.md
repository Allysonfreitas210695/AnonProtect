# Phase 2: Security Hardening - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 10 files modified (0 created)
**Analogs found:** 10 / 10

---

## File Classification

| Modified File                                    | Role          | Data Flow        | Closest Analog                                                                 | Match Quality |
| ------------------------------------------------ | ------------- | ---------------- | ------------------------------------------------------------------------------ | ------------- |
| `src/proxy.ts`                                   | middleware    | request-response | `src/proxy.ts` (extensão do padrão existente)                                  | exact         |
| `src/_shared/lib/auth.ts`                        | config/auth   | request-response | `src/_shared/lib/auth.ts` callbacks `jwt`/`session` existentes                 | exact         |
| `src/_actions/public/register.action.ts`         | server action | request-response | `src/_shared/utils/safe-action.ts` (`ActionError`)                             | exact         |
| `src/app/[locale]/(auth)/login/login-client.tsx` | component     | request-response | Remoção de JSX — sem analog necessário                                         | exact         |
| `src/_actions/public/message.action.ts`          | server action | request-response | `src/_actions/public/report.action.ts` (ownership + ActionError)               | exact         |
| `src/_modules/report/report.data.ts`             | data layer    | CRUD             | `src/_modules/report/report.data.ts` `updateReportAiResults` (usa `encrypt`)   | exact         |
| `src/_modules/admin/admin.data.ts`               | data layer    | CRUD             | `src/_modules/report/report.data.ts` `createMessage` + `updateReportAiResults` | exact         |
| `src/_modules/report/report.query.ts`            | query layer   | CRUD             | `src/_modules/report/report.query.ts` `getReportByCode` (decrypt existente)    | exact         |
| `src/_modules/admin/admin.query.ts`              | query layer   | CRUD             | `src/_modules/admin/admin.query.ts` `getReportById` (decrypt existente)        | exact         |
| `src/_actions/public/report.action.ts`           | server action | request-response | `src/_actions/public/report.action.ts` (mesmo arquivo, 2 linhas)               | exact         |

---

## Pattern Assignments

### `src/proxy.ts` (middleware, request-response) — SEC-01

**Analog:** próprio arquivo, padrão de redirect existente nas linhas 48-57.

**Padrão de redirect existente** (linhas 48-57):

```typescript
if (isPublicRoute) {
  if (
    isLogged &&
    (strippedPathname.startsWith('/login') || strippedPathname.startsWith('/register'))
  ) {
    const locale = localeMatch ? localeMatch[1] : 'pt-BR'
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.nextUrl))
  }
  return response
}

if (!isLogged) {
  const locale = localeMatch ? localeMatch[1] : 'pt-BR'
  return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
}
```

**Mudanças necessárias:**

1. Adicionar bloco de redirect para `/register` ANTES do bloco `isPublicRoute` (após linha 34):

```typescript
// Bloquear /register permanentemente
if (strippedPathname.startsWith('/register')) {
  const locale = localeMatch ? localeMatch[1] : 'pt-BR'
  return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
}
```

2. Remover `/register` da lista `isPublicRoute` (linha 39):

```typescript
// REMOVER esta linha:
strippedPathname.startsWith('/register') ||
```

3. Remover `/register` do bloco `isLogged && isPublicRoute` (linha 51):

```typescript
// ANTES:
strippedPathname.startsWith('/login') || strippedPathname.startsWith('/register')
// DEPOIS:
strippedPathname.startsWith('/login')
```

---

### `src/_shared/lib/auth.ts` (config/auth, request-response) — SEC-01 D-04

**Analog:** callbacks `session` e `jwt` existentes (linhas 38-67) — mesma estrutura `async (args) => { ... }`.

**Padrão de callback existente** (linhas 54-67):

```typescript
async jwt({ token }) {
  if (!token.sub) return token

  const existingUser = await prisma.user.findUnique({
    where: { id: token.sub },
  })

  if (!existingUser) return token

  token.role = existingUser.role
  token.country = existingUser.country
  return token
},
```

**Novo callback `signIn`** — adicionar dentro de `callbacks: { ... }` ANTES de `session`:

```typescript
async signIn({ user, account }) {
  if (account?.provider === 'google') {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })
    if (!existingUser) return false
  }
  return true
},
```

Nota: `prisma` já está importado na linha 5. Nenhum import adicional.

---

### `src/_actions/public/register.action.ts` (server action, request-response) — SEC-01

**Analog:** padrão de `ActionError` de `src/_shared/utils/safe-action.ts` (linha 4-9).

**Padrão ActionError** (safe-action.ts linhas 4-9):

```typescript
export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionError'
  }
}
```

**Mudança:** substituir todo o corpo da action por throw. Defense in depth — proxy redireciona mas action ainda pode ser chamada via POST direto:

```typescript
'use server'

import { actionClient } from '@/_shared/utils/safe-action'
import { ActionError } from '@/_shared/utils/safe-action'
import { registerSchema } from '@/_schemas/auth'

export const registerAction = actionClient.schema(registerSchema).action(async () => {
  throw new ActionError('Registro desabilitado')
})
```

**Teste `register.action.test.ts`** — atualizar para assert do `ActionError`:

```typescript
it('should throw ActionError when called', async () => {
  const result = await registerAction({ name: 'x', email: 'x@x.com', password: '123456' })
  expect(result?.serverError).toBe('Registro desabilitado')
})
```

---

### `src/app/[locale]/(auth)/login/login-client.tsx` (component) — SEC-01 D-03

**Localização do link a remover** (linhas 121-122):

```typescript
<Link href="/register" className="text-primary font-semibold hover:underline">
  {t('registerNow')}
</Link>
```

Remover o elemento `<Link>` e qualquer texto ao redor que referencie registro. Não substituir por nada.

---

### `src/_actions/public/message.action.ts` (server action, request-response) — SEC-02

**Analog:** `src/_actions/public/report.action.ts` — padrão de validação + `ActionError` throw.

**Padrão de validação e erro** (report.action.ts linhas 35-43):

```typescript
if (!rateLimitOk) {
  throw new Error('Limite de denúncias atingido. Tente novamente em 1 hora.')
}
```

**Imports a adicionar:**

```typescript
import { prisma } from '@/_shared/lib/prisma'
import { ActionError } from '@/_shared/utils/safe-action'
```

**Ownership validation** — adicionar ANTES de `reportRepository.createMessage`:

```typescript
.action(async ({ parsedInput: { reportId, code, content } }) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { trackingCode: true },
  })

  if (!report || report.trackingCode !== code) {
    throw new ActionError('Acesso negado')
  }

  await reportRepository.createMessage(reportId, content)

  revalidatePath(`/report/${code}`)
  return { success: true, message: 'Mensagem enviada com sucesso!' }
})
```

**Teste `message.action.test.ts`** — adicionar mock de prisma e dois novos casos:

```typescript
// Adicionar no topo dos mocks:
vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/_shared/lib/prisma'

// Caso de sucesso — atualizar mock:
;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
  trackingCode: 'AP-2026-TEST',
})

// Novo caso: ownership inválido
it('should reject when trackingCode does not match reportId', async () => {
  ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
    trackingCode: 'AP-2026-DIFFERENT',
  })
  const result = await sendMessageAction({
    reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
    code: 'AP-2026-TEST',
    content: 'hello',
  })
  expect(result?.serverError).toBe('Acesso negado')
})

// Novo caso: report não existe
it('should reject when report does not exist', async () => {
  ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
  const result = await sendMessageAction({
    reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
    code: 'AP-2026-TEST',
    content: 'hello',
  })
  expect(result?.serverError).toBe('Acesso negado')
})
```

---

### `src/_modules/report/report.data.ts` (data layer, CRUD) — SEC-03

**Analog:** `updateReportAiResults` no mesmo arquivo (linhas 66-91) — usa `encrypt()` que já está importado na linha 5.

**Padrão encrypt-on-write existente** (linhas 80-81):

```typescript
import { encrypt } from '@/_shared/lib/crypto' // linha 5 — já importado

redactedDescription: encrypt(redactedDescription),
```

**Mudança em `createMessage`** (linhas 55-63) — adicionar `encrypt`:

```typescript
// ANTES (linha 58-59):
content,
// DEPOIS:
content: encrypt(content),
```

**Teste `report.data.test.ts`** — o mock de `encrypt` já existe (linha 39):

```typescript
vi.mock('@/_shared/lib/crypto', () => ({
  encrypt: vi.fn((text) => `encrypted_${text}`),
  decrypt: vi.fn((text) => text.replace('encrypted_', '')),
}))
```

Atualizar assert em `createMessage` (linhas 102-108):

```typescript
// ANTES:
expect(mockPrisma.message.create).toHaveBeenCalledWith({
  data: {
    reportId: 'r1',
    content: 'hello', // <-- mudar para:
    sender: 'USER',
  },
})
// DEPOIS:
expect(mockPrisma.message.create).toHaveBeenCalledWith({
  data: {
    reportId: 'r1',
    content: 'encrypted_hello',
    sender: 'USER',
  },
})
```

---

### `src/_modules/admin/admin.data.ts` (data layer, CRUD) — SEC-03/04

**Analog:** `src/_modules/report/report.data.ts` linhas 1-5 (import pattern) e `updateReportAiResults` (encrypt usage).

**Import a adicionar** (linha 1, após imports existentes):

```typescript
import { encrypt } from '@/_shared/lib/crypto'
```

**Mudança em `createAdminReply`** (linhas 31-49) — adicionar `encrypt`:

```typescript
// ANTES (linha 36):
content,
// DEPOIS:
content: encrypt(content),
```

**Mudança em `createInvestigationNote`** (linhas 51-65) — adicionar `encrypt`:

```typescript
// ANTES (linha 54):
data: { reportId, userId: authorId, content },
// DEPOIS:
data: { reportId, userId: authorId, content: encrypt(content) },
```

---

### `src/_modules/report/report.query.ts` (query layer, CRUD) — SEC-03 (read)

**Analog:** padrão de decrypt existente no mesmo arquivo (linhas 31-41) — copiar e adaptar para array de messages.

**Padrão decrypt existente** (linhas 31-41):

```typescript
let decryptedDescription = report.description
try {
  decryptedDescription = decrypt(report.description)
} catch (e) {
  console.warn('Failed to decrypt report description for public tracking', e)
}

return {
  ...report,
  description: decryptedDescription,
}
```

**Nota crítica:** o `console.warn` na linha 35 é um bug existente — a convenção do projeto usa `logger.warn`. Corrigir junto ao adicionar decrypt de messages.

**Import a adicionar** (após `import { decrypt }` — já existe na linha 4):

```typescript
import { logger } from '@/_shared/lib/logger'
```

**Mudança em `getReportByCode`** — substituir o bloco decrypt existente (linhas 31-42) e adicionar decrypt de messages:

```typescript
let decryptedDescription = report.description
try {
  decryptedDescription = decrypt(report.description)
} catch {
  logger.warn({ code }, 'Falha ao descriptografar descrição da denúncia')
}

const decryptedMessages = report.messages.map((msg) => {
  let content = msg.content
  try {
    content = decrypt(msg.content)
  } catch {
    logger.warn({ messageId: msg.id }, 'Falha ao descriptografar mensagem')
    content = '[DECRYPT_FAILED]'
  }
  return { ...msg, content }
})

return {
  ...report,
  description: decryptedDescription,
  messages: decryptedMessages,
}
```

---

### `src/_modules/admin/admin.query.ts` (query layer, CRUD) — SEC-03/04 (read)

**Analog:** padrão decrypt existente no mesmo arquivo (linhas 62-77) — `getReportById` já decripta `description` e `redactedDescription`.

**Padrão decrypt existente** (linhas 62-77):

```typescript
let decryptedDescription = report.description
let decryptedRedactedDescription = report.redactedDescription

try {
  decryptedDescription = decrypt(report.description)
} catch (e) {
  console.error('Failed to decrypt report description', e)
}

try {
  if (report.redactedDescription) {
    decryptedRedactedDescription = decrypt(report.redactedDescription)
  }
} catch (e) {
  console.error('Failed to decrypt redacted report description', e)
}
```

**Import a adicionar** (após `import { decrypt }` — já existe na linha 5):

```typescript
import { logger } from '@/_shared/lib/logger'
```

**Mudança em `getReportById`** — adicionar decrypt de messages e notes no bloco return (após linha 77), substituindo o return existente (linhas 79-85):

```typescript
const decryptedMessages = report.messages.map((msg) => {
  let content = msg.content
  try {
    content = decrypt(msg.content)
  } catch {
    logger.warn({ messageId: msg.id }, 'Falha ao descriptografar mensagem (admin)')
    content = '[DECRYPT_FAILED]'
  }
  return { ...msg, content }
})

const decryptedNotes = report.investigationNotes.map((note) => {
  let content = note.content
  try {
    content = decrypt(note.content)
  } catch {
    logger.warn({ noteId: note.id }, 'Falha ao descriptografar nota de investigação')
    content = '[DECRYPT_FAILED]'
  }
  return { ...note, content }
})

return {
  ...report,
  description: decryptedDescription,
  redactedDescription: decryptedRedactedDescription,
  attachments: attachmentsWithSignedUrls,
  messages: decryptedMessages,
  investigationNotes: decryptedNotes,
}
```

**Nota:** `getInvestigationNoteById` (linha 156) retorna `InvestigationNote` direto via `findUnique`. Verificar callers — se exibido na UI, adicionar decrypt. Provável uso apenas para verificação de existência antes de delete, portanto baixa prioridade.

---

### `src/_actions/public/report.action.ts` (server action, request-response) — SEC-05 e SEC-06

**Duas mudanças cirúrgicas de uma linha cada.**

**SEC-05** — linha 14, `verifyTurnstile`:

```typescript
// ANTES:
if (!process.env.TURNSTILE_SECRET_KEY) return true
// DEPOIS:
if (!process.env.TURNSTILE_SECRET_KEY) return false
```

**SEC-06** — linha 32, IP normalização:

```typescript
// ANTES:
const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
// DEPOIS:
const ip = ((await headers()).get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim()
```

---

## Shared Patterns

### Encrypt-on-Write

**Fonte:** `src/_modules/report/report.data.ts` linha 5 (import) + linhas 80-81 (uso)
**Aplicar em:** `report.data.ts:createMessage`, `admin.data.ts:createAdminReply`, `admin.data.ts:createInvestigationNote`

```typescript
import { encrypt } from '@/_shared/lib/crypto'
// uso:
content: encrypt(content)
```

### Decrypt-on-Read com Fallback `[DECRYPT_FAILED]`

**Fonte:** `src/_modules/report/report.query.ts` linhas 31-41 (padrão base)
**Aplicar em:** `report.query.ts:getReportByCode` (messages), `admin.query.ts:getReportById` (messages + notes)

```typescript
import { logger } from '@/_shared/lib/logger'
// uso:
let content = item.content
try {
  content = decrypt(item.content)
} catch {
  logger.warn({ id: item.id }, 'Falha ao descriptografar [campo]')
  content = '[DECRYPT_FAILED]'
}
return { ...item, content }
```

**Atenção:** usar `logger.warn` (pino), NUNCA `console.warn`/`console.error`. Os dois arquivos query existentes usam `console.error` — corrigir junto às mudanças.

### ActionError para Rejeição de Acesso

**Fonte:** `src/_shared/utils/safe-action.ts` linhas 4-9 + linhas 28-33 (uso nos action clients)
**Aplicar em:** `register.action.ts` (corpo desabilitado), `message.action.ts` (ownership failure)

```typescript
import { ActionError } from '@/_shared/utils/safe-action'
// uso:
throw new ActionError('Mensagem em português')
```

### Redirect de Middleware

**Fonte:** `src/proxy.ts` linhas 59-62
**Aplicar em:** `proxy.ts` bloco novo para `/register`

```typescript
const locale = localeMatch ? localeMatch[1] : 'pt-BR'
return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
```

---

## No Analog Found

Nenhum — todas as mudanças desta fase são modificações de arquivos existentes com padrões já estabelecidos no codebase.

---

## Pitfalls Mapeados (para o Planner)

| Pitfall                                                         | Arquivo Afetado                              | Ação Necessária                                                              |
| --------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| `createAdminReply` também cria `Message` sem encrypt            | `admin.data.ts` linhas 31-49                 | Adicionar `encrypt(content)` — não apenas `createInvestigationNote`          |
| `getReportById` em `admin.query.ts` inclui messages sem decrypt | `admin.query.ts` linhas 37-38                | Adicionar map de decrypt para `report.messages` além de `investigationNotes` |
| Teste `report.data.test.ts` linha 104 vai quebrar               | `report.data.test.ts`                        | Atualizar assert `content: 'hello'` → `content: 'encrypted_hello'`           |
| Teste `message.action.test.ts` sem mock de prisma               | `message.action.test.ts`                     | Adicionar `vi.mock('@/_shared/lib/prisma', ...)` com `report.findUnique`     |
| `/register` permanece em `isPublicRoute` após redirect          | `proxy.ts` linha 39                          | Remover da lista `isPublicRoute` junto ao novo bloco de redirect             |
| `console.warn`/`console.error` em query files                   | `report.query.ts:35`, `admin.query.ts:67,74` | Substituir por `logger.warn`/`logger.error` ao tocar nesses blocos           |
| `seed.ts` não cria Messages/InvestigationNotes                  | `prisma/seed.ts`                             | D-09 é no-op verificado — nenhuma ação necessária                            |

---

## Metadata

**Diretórios pesquisados:** `src/_actions/`, `src/_modules/`, `src/_shared/`, `src/proxy.ts`, `src/app/[locale]/(auth)/login/`
**Arquivos lidos:** 12
**Data de mapeamento:** 2026-06-30
