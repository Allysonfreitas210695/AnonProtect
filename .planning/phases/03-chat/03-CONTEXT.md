# Phase 3: Chat - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the bidirectional chat interface between whistleblowers and admins, and activate AWS SES email notifications so admins know when new messages arrive.

**Scope:** Remove the 50-message hard cap in admin.query.ts, implement a `sendEmail` helper using SES, and wire email notification into `sendMessageAction`. The chat UI already exists on both sides — this phase is surgical.

</domain>

<decisions>
## Implementation Decisions

### Paginação de Mensagens (CHAT-04)

- **D-01:** Remove the `take: 50` hard cap from `getReportById` in `src/_modules/admin/admin.query.ts`. No pagination UI needed — threads for a TCC deployment are unlikely to exceed 50 messages in practice. Simply fetching all messages keeps the implementation simple and consistent with the public side (`getReportByCode` already has no cap).

### Destinatários do Email (CHAT-07)

- **D-02:** Notify only the admin assigned to the report (`report.assignedTo`). If `assignedTo` is null (no admin assigned yet), do not send email. This avoids spamming all admins and respects the assignment workflow.

### Conteúdo do Email (CHAT-07)

- **D-03:** Email is a generic notification only — no whistleblower message content included. Email body: "Nova mensagem recebida no relatório [trackingCode]. Acesse o painel para visualizar." Include a direct link to `/admin/report/[reportId]`. No sensitive content outside the admin panel.

### Degradação Gracíosa do SES

- **D-04:** If `sesClient` is null (no AWS credentials) or the SES call throws, log the error with `logger.error` and let `sendMessageAction` succeed anyway. The message is saved regardless — email is best-effort. Follows the existing pattern of graceful degradation (S3 returns null when unconfigured).

### Claude's Discretion

- Email subject line, HTML vs plain text format, and exact link construction are left to Claude.
- `sendEmail` helper location: `src/_shared/lib/aws.ts` alongside the existing `sesClient` and `getDownloadUrl`.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Chat Infrastructure

- `src/_actions/public/message.action.ts` — `sendMessageAction`: public action for whistleblower messages; needs email notification wired in
- `src/_actions/admin/report.action.ts` — `sendAdminReplyAction`: admin reply action (already exists)
- `src/_hooks/public/use-message.ts` — public message hook
- `src/_hooks/admin/use-admin-message.ts` — admin message hook
- `src/_components/shared/message-list.tsx` — shared chat UI component (fully functional, used by both sides)
- `src/app/[locale]/(auth)/report/[code]/page.tsx` — public tracking page with chat (fully functional)
- `src/app/[locale]/(auth)/report/[code]/_components/message-form.tsx` — public message form
- `src/app/[locale]/(admin)/admin/report/[id]/page.tsx` — admin report detail with chat (fully functional)
- `src/app/[locale]/(admin)/admin/report/[id]/_components/admin-message-form.tsx` — admin message form

### Data Layer (where the 50-message cap lives)

- `src/_modules/admin/admin.query.ts` — line 38: `messages: { orderBy: { createdAt: 'asc' }, take: 50 }` → remove `take: 50`
- `src/_modules/report/report.query.ts` — `getReportByCode`: already has no cap; reference for decryption pattern

### AWS SES Integration

- `src/_shared/lib/aws.ts` — `sesClient` and `SES_FROM_EMAIL` already defined; add `sendEmail` helper here
- `src/_shared/lib/logger.ts` — use for error logging on SES failure

### Architecture & Patterns

- `CLAUDE.md` — project architecture, conventions, action patterns, safe-action tiered clients
- `.planning/REQUIREMENTS.md` — CHAT-01 through CHAT-07 requirement IDs
- `.planning/ROADMAP.md` — phase 3 success criteria

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `MessageList` component (`src/_components/shared/message-list.tsx`): fully styled chat bubble UI, handles `USER`/`ADMIN` sender differentiation, empty state, print layout — no changes needed
- `sendMessageAction` (`src/_actions/public/message.action.ts`): add `sesClient` email call after `createMessage` succeeds; already has `reportId` in scope to fetch `assignedTo.email`
- `sesClient` + `SES_FROM_EMAIL` (`src/_shared/lib/aws.ts`): SES client already initialized; just needs `sendEmail` function using `SendEmailCommand` from `@aws-sdk/client-ses`

### Established Patterns

- Fire-and-forget async for non-critical side effects (e.g., `processAiAnalysis` in `report.data.ts` — catch errors internally, never fail the main action)
- Graceful degradation: `if (!sesClient) { logger.warn(...); return }` mirrors `if (!s3Client) return null`
- `revalidatePath` already called in `sendMessageAction` — no changes needed there
- Encryption/decryption: `Message.content` is already encrypted on write and decrypted on read (completed in Phase 2)

### Integration Points

- `sendMessageAction` → add SES call → needs `prisma.report.findUnique` with `include: { assignedTo: { select: { email: true } } }` to get the assigned admin's email
- `admin.query.ts:38` → remove `take: 50` to satisfy CHAT-04; no other changes to the query needed

</code_context>

<specifics>
## Specific Ideas

- The report's `assignedTo` field is already fetched in `getReportById` — in `sendMessageAction`, a separate query for assignee email will be needed since the action doesn't receive the full report object.
- Email notification is fire-and-forget: wrap in `try/catch`, log failure with `logger.error`, and resolve the action successfully regardless.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 3-chat_
_Context gathered: 2026-06-30_
