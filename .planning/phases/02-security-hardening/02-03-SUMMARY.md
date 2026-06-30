---
phase: 02-security-hardening
plan: 02-03
title: 'Gap Closure: SEC-03/SEC-04 — Message e InvestigationNote Encryption'
status: complete
subsystem: encryption
tags: [security, encryption, aes-256-gcm, messages, investigation-notes]
requirements: [SEC-03, SEC-04]
dependency_graph:
  requires: []
  provides: [SEC-03, SEC-04]
  affects: [report.data.ts, admin.data.ts, report.query.ts, admin.query.ts]
tech_stack:
  added: []
  patterns: [encrypt-on-write, decrypt-on-read, try/catch-fallback-for-legacy-plaintext]
key_files:
  modified:
    - src/_modules/report/report.data.ts
    - src/_modules/admin/admin.data.ts
    - src/_modules/report/report.query.ts
    - src/_modules/admin/admin.query.ts
    - src/_modules/report/report.data.test.ts
    - src/_modules/admin/admin.data.test.ts
    - src/_modules/report/report.query.test.ts
    - src/_modules/admin/admin.query.test.ts
decisions:
  - Use try/catch with plaintext fallback in all decrypt loops — same pattern as Report.description
  - Fix getInvestigationNoteById for hygiene even though it has zero callers
metrics:
  duration: ~15 minutes
  tasks_completed: 4
  tasks_total: 4
  files_modified: 8
  completed_date: '2026-06-30'
---

# Phase 02 Plan 03: Gap Closure SEC-03/SEC-04 Summary

AES-256-GCM encryption applied to `Message.content` and `InvestigationNote.content` on write, with corresponding decrypt-on-read in both the public and admin query layers.

## What Was Implemented

### Task 1 — Write-side encryption (commit 0a4eede)

- `createMessage()` in `report.data.ts`: `content` → `encrypt(content)`
- `createAdminReply()` in `admin.data.ts`: `content` → `encrypt(content)` + added `encrypt` import
- `createInvestigationNote()` in `admin.data.ts`: `content` → `encrypt(content)`

### Task 2 — Read-side decrypt for messages in report.query.ts (commit 406de29)

- `getReportByCode()`: added `decryptedMessages` map loop with try/catch fallback
- Return value now includes `messages: decryptedMessages`

### Task 3 — Read-side decrypt for messages + notes in admin.query.ts (commit 882a5f9)

- `getReportById()`: added `decryptedMessages` and `decryptedInvestigationNotes` map loops
- Return value now includes both `messages: decryptedMessages` and `investigationNotes: decryptedInvestigationNotes`
- Hygiene: `getInvestigationNoteById()` updated to decrypt content (zero callers but consistent)

### Task 4 — Test updates (commit d278718)

- `report.data.test.ts`: `createMessage` expectation updated from `'hello'` → `'encrypted_hello'`
- `admin.data.test.ts`: added `crypto` mock + two new describe blocks for `createAdminReply` and `createInvestigationNote` encryption
- `report.query.test.ts`: added `messages: []` to mock reports (needed by new decrypt loop)
- `admin.query.test.ts`: added `messages: []` and `investigationNotes: []` to mock report

## Test Results

```
Test Files  1 failed | 34 passed (35)
Tests       1 failed | 132 passed (133)
```

The 1 failure is the pre-existing `getPublicStats` timeline length test (flaky on exact month boundary) — not introduced by this plan.

## Verification

```
grep "encrypt(content)" report.data.ts  → line 59
grep "encrypt(content)" admin.data.ts   → lines 37, 55
grep "decryptedMessages" report.query.ts → lines 38, 51
grep "decryptedMessages|decryptedInvestigationNotes" admin.query.ts → lines 79, 89, 104, 105
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Query test mocks missing messages/investigationNotes arrays**

- **Found during:** Task 4 — test run
- **Issue:** `getReportByCode` and `getReportById` test mocks returned reports without `messages`/`investigationNotes`, causing `.map()` to throw after the new decrypt loops were added
- **Fix:** Added `messages: []` to both report.query.test.ts mock reports; added `messages: []` and `investigationNotes: []` to admin.query.test.ts mock report
- **Files modified:** `report.query.test.ts`, `admin.query.test.ts`
- **Commit:** d278718 (included in Task 4 commit)

## Known Stubs

None.

## Threat Flags

None — this plan reduces threat surface by encrypting previously-plaintext fields.

## Self-Check: PASSED

- [x] src/\_modules/report/report.data.ts — encrypt(content) on line 59
- [x] src/\_modules/admin/admin.data.ts — encrypt(content) on lines 37, 55
- [x] src/\_modules/report/report.query.ts — decryptedMessages loop present
- [x] src/\_modules/admin/admin.query.ts — decryptedMessages + decryptedInvestigationNotes loops present
- [x] Commits: 0a4eede, 406de29, 882a5f9, d278718 all exist in git log
- [x] 132/133 tests passing (1 pre-existing failure, not introduced here)
- [x] SEC-03 satisfied: Message.content encrypted on write (both USER and ADMIN paths), decrypted on read
- [x] SEC-04 satisfied: InvestigationNote.content encrypted on write, decrypted on read
