# Phase 3: Chat - Pattern Map

**Mapped:** 2026-07-02
**Files analyzed:** 4 (3 edits + 1 new env doc touch)
**Analogs found:** 4 / 4

## File Classification

| New/Modified File                                       | Role                               | Data Flow                          | Closest Analog                                                                                                                                        | Match Quality      |
| ------------------------------------------------------- | ---------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/_shared/lib/aws.ts` (add `sendEmail`)              | utility (external service wrapper) | request-response (fire-and-forget) | same file, `getDownloadUrl` (lines 20-29)                                                                                                             | exact              |
| `src/_actions/public/message.action.ts` (wire email)    | action                             | request-response                   | same file, existing `sendMessageAction` (lines 15-31); side-effect shape from `src/_modules/report/report.data.ts` `processAiAnalysis` (lines 91-119) | exact / role-match |
| `src/_modules/admin/admin.query.ts` (remove `take: 50`) | model/query                        | CRUD (read)                        | same file, `getReportById` (lines 32-49); cap-free reference: `src/_modules/report/report.query.ts` `getReportByCode`                                 | exact              |
| `.env` / env docs (new `NEXT_PUBLIC_APP_URL`)           | config                             | n/a                                | existing `AWS_SES_FROM_EMAIL` / `AWS_S3_BUCKET_NAME` declarations in `src/_shared/lib/aws.ts` (lines 38-39)                                           | role-match         |

## Pattern Assignments

### `src/_shared/lib/aws.ts` (utility, add `sendEmail`)

**Analog:** same file — `getDownloadUrl` (graceful-degradation wrapper) + existing `sesClient`/`SES_FROM_EMAIL` singletons.

**Imports pattern** (lines 1-3, extend with):

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from '@/_shared/lib/logger'
```

**Graceful-degradation pattern** (lines 20-29, `getDownloadUrl` — mirror this shape):

```typescript
export async function getDownloadUrl(key: string) {
  if (!s3Client || !BUCKET_NAME) return null

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
```

**Existing singletons to reuse** (lines 31-39):

```typescript
export const sesClient = hasAwsCredentials ? new SESClient({ region, credentials }) : null

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''
export const SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || ''
```

**New function to add** (append after `SES_FROM_EMAIL` export), following the `getDownloadUrl` null-check + the project's `logger.error({ ctx }, 'message')` convention:

```typescript
export async function sendEmail(to: string, subject: string, htmlBody: string) {
  if (!sesClient || !SES_FROM_EMAIL) {
    logger.warn({ to }, 'SES não configurado — email não enviado')
    return
  }

  try {
    const command = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Html: { Charset: 'UTF-8', Data: htmlBody } },
      },
    })
    await sesClient.send(command)
  } catch (error) {
    logger.error({ to, error }, 'Falha ao enviar email via SES')
  }
}
```

Note: this function must never throw — caller (`sendMessageAction`) relies on that guarantee per D-04.

---

### `src/_actions/public/message.action.ts` (action, request-response)

**Analog:** same file's existing `sendMessageAction`, extended with the fire-and-forget side-effect shape used by `processAiAnalysis` in `src/_modules/report/report.data.ts` (lines 91-119).

**Current full file (imports + core pattern + error handling), lines 1-31:**

```typescript
'use server'

import { actionClient, ActionError } from '@/_shared/utils/safe-action'
import * as reportRepository from '@/_modules/report/report.data'
import { prisma } from '@/_shared/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sendMessageSchema = z.object({
  reportId: z.uuid(),
  code: z.string().min(1, 'Código é obrigatório'),
  content: z.string().min(1, 'A mensagem não pode estar vazia'),
})

export const sendMessageAction = actionClient
  .schema(sendMessageSchema)
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

**Required edit — extend `select` (Pitfall 3, single round-trip) and add email call after `createMessage`:**

```typescript
const report = await prisma.report.findUnique({
  where: { id: reportId },
  select: {
    trackingCode: true,
    assignedTo: { select: { email: true } },
  },
})

if (!report || report.trackingCode !== code) {
  throw new ActionError('Acesso negado')
}

await reportRepository.createMessage(reportId, content)

if (report.assignedTo?.email) {
  await sendEmail(
    report.assignedTo.email,
    'Nova mensagem no AnonProtect',
    `<p>Nova mensagem recebida no relatório ${code}.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/report/${reportId}">Acesse o painel para visualizar.</a></p>`
  )
}

revalidatePath(`/report/${code}`)
return { success: true, message: 'Mensagem enviada com sucesso!' }
```

Add `import { sendEmail } from '@/_shared/lib/aws'` to the import block above.

**Fire-and-forget error-swallowing pattern** (analog: `src/_modules/report/report.data.ts` lines 91-119, `processAiAnalysis`):

```typescript
export async function processAiAnalysis(reportId: string, description: string, country?: string) {
  logger.debug({ reportId }, 'Iniciando análise de IA em background')
  try {
    // ... work
  } catch (error) {
    logger.error({ reportId, error }, 'Falha no processamento de IA em background')
  }
}
```

`sendEmail` already internalizes this try/catch (see above), so `sendMessageAction` does not need its own extra try/catch around the call — mirror the "guaranteed non-throwing helper" relationship, not the try/catch itself.

---

### `src/_modules/admin/admin.query.ts` (model/query, CRUD read)

**Analog:** same file's `getReportById`; cap-free reference `getReportByCode` in `src/_modules/report/report.query.ts`.

**Current pattern** (lines 32-49, relevant slice at line 38):

```typescript
export async function getReportById(id: string) {
  const report = await prisma.report.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      assignedTo: true,
      assignedDepartment: true,
      attachments: { orderBy: { createdAt: 'desc' } },
      investigationNotes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
```

**Required edit** — remove `take: 50`, keep `orderBy` (matches public-side, uncapped convention already used by `getReportByCode`):

```typescript
messages: { orderBy: { createdAt: 'asc' } },
```

---

## Shared Patterns

### Graceful degradation for optional external services

**Source:** `src/_shared/lib/aws.ts`, `getDownloadUrl` (lines 20-29) and `s3Client`/`sesClient` null-init (lines 13-18, 31-36)
**Apply to:** `sendEmail` in `aws.ts`

```typescript
if (!s3Client || !BUCKET_NAME) return null
```

Mirror as `if (!sesClient || !SES_FROM_EMAIL) { logger.warn(...); return }`.

### Fire-and-forget non-critical side effects

**Source:** `src/_modules/report/report.data.ts`, `processAiAnalysis` (lines 91-119)
**Apply to:** email notification call site in `sendMessageAction` — the primary mutation (`createMessage`) must succeed regardless of side-effect outcome.

### Structured logging

**Source:** `src/_shared/lib/logger.ts` (pino singleton); usage convention `logger.error({ ctx }, 'message in Portuguese')` seen throughout `report.data.ts`
**Apply to:** `sendEmail`'s warn/error branches — context object first, Portuguese message second.

### Minimal-select Prisma queries in public actions

**Source:** `src/_actions/public/message.action.ts`, existing `prisma.report.findUnique({ select: { trackingCode: true } })`
**Apply to:** extend `select` with `assignedTo: { select: { email: true } }` rather than adding a second query (Pitfall 3 in RESEARCH.md).

## No Analog Found

| File                                         | Role   | Data Flow        | Reason                                                                                                                                                                                                                      |
| -------------------------------------------- | ------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` env var declaration    | config | n/a              | No existing base-URL env var in the codebase (confirmed by RESEARCH.md grep); model its declaration/usage after `AWS_SES_FROM_EMAIL` (`process.env.X                                                                        |     | 'fallback'`) in `aws.ts`lines 38-39, defaulting to`http://localhost:3000` |
| `src/_actions/public/message.action.test.ts` | test   | request-response | No existing test file for this action (Wave 0 gap per RESEARCH.md); use sibling action tests under `src/_actions/` as structural reference if any exist, otherwise Prisma mock pattern from `src/__tests__/mocks/prisma.ts` |
| `src/_shared/lib/aws.test.ts`                | test   | n/a              | No existing test for `aws.ts` (Wave 0 gap); will need an SES client mock — no analog in repo, follow `src/__tests__/mocks/prisma.ts` structuring conventions (typed mock via `vitest-mock-extended`)                        |

## Metadata

**Analog search scope:** `src/_shared/lib/`, `src/_actions/public/`, `src/_modules/admin/`, `src/_modules/report/`
**Files scanned:** `aws.ts`, `message.action.ts`, `admin.query.ts`, `report.data.ts`, `report.query.ts`, `logger.ts`
**Pattern extraction date:** 2026-07-02
