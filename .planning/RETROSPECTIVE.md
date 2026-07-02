# Project Retrospective

_A living document updated after each milestone. Lessons feed forward into future planning._

## Milestone: v1.0 — MVP

**Shipped:** 2026-07-02
**Phases:** 5 | **Plans:** 10 | **Requirements:** 27/27 v1

### What Was Built

- 4 critical bugs fixed in the whistleblower/admin flow (tracking-code validator, country filter, ToS page, redundant role check)
- 6 security gaps closed (SUPERVISOR self-registration block, message ownership validation, AES-256-GCM encryption of messages/notes, Turnstile fail-closed, Cloudflare-aware rate limiting)
- Complete bidirectional chat (whistleblower ↔ admin) with AWS SES email notification, uncapped thread, dedicated rate limiting, and a 1000-message-per-report cap
- Password recovery via AWS SES with CSPRNG single-use tokens (1h expiry)
- Performance/quality debt closed: JWT-cached role/country, SQL-aggregated public stats, CSPRNG tracking codes, structured logging (server pino + client-safe shim), Prisma enum for priority, `[DECRYPT_FAILED]` sentinel everywhere

### What Worked

- Wave-based parallel execution (git worktrees) for independent gap-closure plans (03-04, 03-05) — zero merge conflicts, clean history
- Retroactive verification (`gsd-verifier`) caught 2 real gaps (QUAL-02, QUAL-04) in phases implemented manually outside GSD — the goal-backward check against ROADMAP success criteria, not just "does the file exist," found actual bugs (raw ciphertext leaking to admin UI)
- Documented overrides (D-01 for CHAT-04/SC-4) kept a locked user decision honored instead of silently reducing scope, while still making the ROADMAP wording literally true

### What Was Inefficient

- Phases 4 and 5 were implemented manually outside the GSD discuss→plan→execute flow (commit `11a9ec5`). This was faster in the moment but left REQUIREMENTS.md traceability badly desynced — SEC-01/02/05/06 and all 7 CHAT-\* rows still showed "Pending" despite the phases being functionally complete, and had to be manually reconciled against VERIFICATION.md evidence before the milestone could close
- 02-VERIFICATION.md's frontmatter was never updated after gap-closure plan 02-03 fixed the SEC-03/SEC-04 gap it reported — the same "verified once, never re-synced" pattern as REQUIREMENTS.md
- No browser automation tool was available in-session for final UAT closure (Phase 1's 3 pending human-verification scenarios); 2 of 3 had to be confirmed by code inspection rather than live interaction, and the production database (no local Docker access) ruled out creating live test data

### Patterns Established

- Retroactive verification workflow for manually-implemented phases: spawn `gsd-verifier` with explicit ROADMAP success criteria + key files, treat findings as real gaps (not rubber-stamped), fix inline, re-confirm, then sync REQUIREMENTS.md/ROADMAP.md/STATE.md
- Pre-milestone-close artifact audit (`gsd-sdk query audit-open`) surfaces exactly this kind of drift — stale verification frontmatter and open UAT scenarios — before they get silently archived and forgotten
- Client/server logging boundary: `pino` cannot run in the browser; a minimal `client-logger.ts` shim (dev-only console, no-op in prod) is the right-sized fix rather than a heavier universal logging solution

### Key Lessons

1. Manual implementation outside GSD is a valid speed tradeoff, but it must be paired with a retroactive verification pass before milestone close — otherwise tracking drift compounds silently across phases
2. "Pending" in a traceability table is not evidence of incompleteness by itself — always cross-check against the phase's actual VERIFICATION.md before treating it as a real gap
3. When a verifier finds a scope-boundary issue (like QUAL-02's client/server split), investigate before accepting an override — often a small, correctly-scoped fix (the client-logger shim) is cheaper than formalizing a permanent exception
4. UAT closure without browser tooling is possible via code-level confirmation (regex/logic matching) when the underlying fix was already validated by an earlier code-level pass — but this should be the fallback, not the default, and should be recorded as such rather than silently marked "passed"

### Cost Observations

- Sessions: 1 continuous session covering phase 3 wave execution through v1.0 milestone close
- Notable: heaviest cost was the retroactive verification + gap reconciliation work for phases 4/5 and the traceability corrections for phases 1-3 — meaningfully more expensive than the original manual implementation it was verifying

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change                                                               |
| --------- | -------- | ------ | ------------------------------------------------------------------------ |
| v1.0      | 1        | 5      | Established retroactive-verification pattern for manually-shipped phases |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
| --------- | ----- | -------- | ------------------ |
| v1.0      | 148   | —        | 0                  |

### Top Lessons (Verified Across Milestones)

1. Retroactive verification against ROADMAP success criteria (not just file presence) catches real bugs in manually-shipped work
