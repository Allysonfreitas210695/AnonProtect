# Roadmap: AnonProtect

## Overview

Brownfield TCC project with an existing, working foundation. Five phases close known bugs, harden security, complete the chat feature, activate password recovery via AWS SES, and polish code quality — producing a system that looks polished and works correctly for the oral defense.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Bug Fixes** - Eliminate known defects in the tracking code validator, country filter, missing page, and redundant role check (completed 2026-06-30)
- [x] **Phase 2: Security Hardening** - Close all known security gaps before the system handles real data (completed 2026-06-30)
- [ ] **Phase 3: Chat** - Complete the full bidirectional chat UI and email notification for whistleblower ↔ admin communication
- [ ] **Phase 4: Password Recovery** - Activate AWS SES to deliver secure, time-limited password reset links to admins
- [ ] **Phase 5: Performance & Quality** - Eliminate performance anti-patterns, unsafe randomness, silent failures, and console noise

## Phase Details

### Phase 1: Bug Fixes

**Goal:** The core whistleblower flow and admin functions work without known defects
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria** (what must be TRUE):

1. Whistleblower can track a report using the `AP-YYYY-XXXX` format without a validation error
2. Admin can filter reports by country and the filter is not silently overridden by `filterCountry`
3. `/terms-of-service` page renders without a 404 during the registration flow
4. `deleteReportAction` contains no redundant role check alongside `adminActionClient` enforcement
   **Plans:** 2/2 plans complete
   **UI hint:** yes
   Plans:

- [x] 01-01-PLAN.md — Corrige validador de tracking code (BUG-01) e remove role check redundante em deleteReportAction (BUG-04)
- [x] 01-02-PLAN.md — Consolida filtro de país em getReportsPaginated (BUG-02) e expande página ToS com i18n nos 3 idiomas (BUG-03)

### Phase 2: Security Hardening

**Goal:** All known security gaps are closed before the system handles real data
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):

1. A user cannot self-register as SUPERVISOR — direct registration without ADMIN invite is rejected
2. A mismatched `code` and `reportId` pair is rejected by `sendMessageAction` before any message is created
3. `Message.content` and `InvestigationNote.content` are stored encrypted (AES-256-GCM) in the database
4. Omitting `TURNSTILE_SECRET_KEY` causes Turnstile verification to fail, not pass silently
5. Rate limiting keys on only the first IP in `x-forwarded-for`, not the full comma-separated string
   **Plans:** 3/3 plans complete

### Phase 3: Chat

**Goal:** Whistleblowers and admins can communicate through a complete, paginated chat interface
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07
**Success Criteria** (what must be TRUE):

1. Whistleblower can view all messages in their report thread by entering the tracking code on the tracking page
2. Whistleblower can send a new message and see it appear in the thread
3. Admin/supervisor can read the full message thread and send a reply from the report detail page
4. Threads with more than 50 messages paginate correctly — no hard cap truncation
5. Admin receives an email (via AWS SES) when the whistleblower sends a new message
   **Plans:** 2/3 plans executed
   **UI hint:** yes
   Plans:

- [x] 03-01-PLAN.md — Adiciona helper sendEmail (SES SendEmailCommand) com degradação graciosa em aws.ts (CHAT-07)
- [ ] 03-02-PLAN.md — Conecta notificação por email em sendMessageAction e introduz NEXT_PUBLIC_APP_URL (CHAT-07, CHAT-01/02/03)
- [x] 03-03-PLAN.md — Remove cap take:50 em getReportById para thread completa no admin (CHAT-04/05/06)

### Phase 4: Password Recovery

**Goal:** Admins can regain account access through a secure, email-based password reset flow
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):

1. Admin who requests a password reset receives a real email with a reset link (via AWS SES)
2. Reset link expires after 1 hour and is rejected if submitted after expiry
3. Admin who clicks a valid link can set a new password and log in successfully
4. Using the reset link a second time is rejected — token is invalidated on first use
   **Plans:** TBD
   **UI hint:** yes

### Phase 5: Performance & Quality

**Goal:** The codebase has no performance anti-patterns, unsafe randomness, silent failures, or console noise
**Mode:** mvp
**Depends on:** Phase 4
**Requirements:** PERF-01, PERF-02, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):

1. Authenticated requests do not query the database for `role` and `country` — values are read from the JWT cache
2. Public stats page loads using SQL aggregation (`date_trunc` + `GROUP BY`), not in-memory timestamp arrays
3. Tracking codes are generated with `crypto.randomBytes()` (CSPRNG) and uniqueness is verified with retry before insertion
4. No `console.log`, `console.warn`, or `console.error` calls exist in production code — all replaced by pino `logger`
5. `Report.priority` is stored as a Prisma enum (`ReportPriority`) with a database-level constraint
6. A decryption failure displays `[DECRYPT_FAILED]` in the UI instead of raw ciphertext

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase                    | Plans Complete | Status      | Completed  |
| ------------------------ | -------------- | ----------- | ---------- |
| 1. Bug Fixes             | 2/2            | Complete    | 2026-06-30 |
| 2. Security Hardening    | 3/3            | Complete    | 2026-06-30 |
| 3. Chat                  | 2/3            | In Progress |            |
| 4. Password Recovery     | 0/TBD          | Not started | -          |
| 5. Performance & Quality | 0/TBD          | Not started | -          |
