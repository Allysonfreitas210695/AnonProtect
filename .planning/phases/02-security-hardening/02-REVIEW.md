---
phase: 02-security-hardening
reviewed: 2026-06-30T18:15:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/_actions/public/message.action.test.ts
  - src/_actions/public/message.action.ts
  - src/_actions/public/register.action.test.ts
  - src/_actions/public/register.action.ts
  - src/_actions/public/report.action.ts
  - src/app/[locale]/(auth)/login/login-client.tsx
  - src/_hooks/public/use-register.ts
  - src/proxy.ts
  - src/_shared/lib/auth.ts
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-30T18:15:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Security-hardening phase reviewed against 6 declared fixes (SEC-01, SEC-02, SEC-05, SEC-06, and two UI/UX removals). SEC-02 (IDOR in sendMessageAction) and the login UI changes are implemented correctly. Two critical gaps remain: the proxy `/register` block is bypassed by the `es` locale, and the Turnstile SEC-05 fix is incomplete because the token field is optional in the schema — an attacker can omit it entirely and skip bot verification regardless of whether `TURNSTILE_SECRET_KEY` is set.

---

## Critical Issues

### CR-01: `es` locale bypasses `/register` proxy block (SEC-01 incomplete)

**File:** `src/proxy.ts:33`

**Issue:** The locale-stripping regex only lists two of three configured locales:

```
/^\/(pt-BR|en)(\/|$)/
```

`src/i18n/request.ts` defines `locales = ['pt-BR', 'en', 'es']`. When the path is `/es/register`:

- `localeMatch` is `null`
- `strippedPathname` is `/es/register` (unchanged)
- Line 37: `strippedPathname.startsWith('/register')` → `false` → **block does not fire**

The page renders; actual registration fails because `registerAction` always throws, but the proxy-level enforcement is bypassed. The same gap affects `/es/login` (logged-in users are not redirected to admin) and any other protected route under the `es` locale where the locale would not be stripped before the `isPublicRoute`/auth checks.

**Fix:**

```ts
const localeMatch = pathname.match(/^\/(pt-BR|en|es)(\/|$)/)
```

---

### CR-02: Turnstile verification skippable — SEC-05 fix is incomplete

**File:** `src/_actions/public/report.action.ts:39` and `src/_schemas/report.ts:13`

**Issue:** `turnstileToken` is `z.string().optional()` in the schema. The action only calls `verifyTurnstile` when the token is truthy:

```ts
if (parsedInput.turnstileToken) {
  const isHuman = await verifyTurnstile(parsedInput.turnstileToken)
  if (!isHuman) throw new Error('Falha na verificação de captcha...')
}
```

An attacker submitting a request that simply omits `turnstileToken` (or sends `null`/`""`) bypasses the bot check entirely, regardless of whether `TURNSTILE_SECRET_KEY` is configured. The SEC-05 fix (`if (!process.env.TURNSTILE_SECRET_KEY) return false`) only matters when a token _is_ present but the key is absent — the more exploitable path (no token at all) is completely unguarded.

**Fix:** Make the token required when `TURNSTILE_SECRET_KEY` is configured, or always require it in the schema and fail-closed when the key is absent:

```ts
// report.action.ts — enforce that the token must be present
const isHuman = await verifyTurnstile(parsedInput.turnstileToken ?? '')
if (!isHuman) {
  throw new Error('Falha na verificação de captcha. Tente novamente.')
}
```

```ts
// report.ts schema — make token required
turnstileToken: z.string().min(1, 'Token de verificação obrigatório'),
```

Alternatively, if Turnstile-less environments must be supported, at minimum add a server-side guard:

```ts
if (!parsedInput.turnstileToken && process.env.TURNSTILE_SECRET_KEY) {
  throw new Error('Falha na verificação de captcha. Tente novamente.')
}
```

---

## Warnings

### WR-01: Rate-limit IP extracted from leftmost `x-forwarded-for` (SEC-06 spoofable)

**File:** `src/_actions/public/report.action.ts:32`

**Issue:**

```ts
const ip = ((await headers()).get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim()
```

The leftmost entry in `X-Forwarded-For` is the value supplied by the HTTP client and is fully attacker-controlled. An attacker can rotate through arbitrary IP strings on each request to bypass the 10-reports/hour sliding window. The correct trusted IP depends on deployment topology: behind Cloudflare, `CF-Connecting-IP` is authoritative; behind a single trusted proxy, the _rightmost_ entry is the one appended by the proxy and therefore trusted.

**Fix:** For Cloudflare deployments, prefer `CF-Connecting-IP`:

```ts
const rawIp =
  (await headers()).get('cf-connecting-ip') ||
  ((await headers()).get('x-forwarded-for') || '').split(',').at(-1)?.trim() ||
  '127.0.0.1'
```

At minimum, document the trust model assumption so the limitation is explicit.

---

### WR-02: `es` locale breaks login-redirect and auth-redirect UX

**File:** `src/proxy.ts:33-39, 54-57, 62-63`

**Issue:** As a secondary consequence of the missing `es` locale in the regex (CR-01): when `strippedPathname` is not de-prefixed, all locale-aware redirects fall back to `pt-BR`:

- A logged-in Spanish user visiting `/es/login` is not redirected to `/es/admin` (the `isPublicRoute` check for `/login` never fires because strippedPathname is `/es/login`).
- Unauthenticated users hitting protected `/es/*` routes are sent to `/pt-BR/login` instead of `/es/login`.

This is a correctness issue independent of CR-01, but shares the same root cause. Fixing CR-01 resolves this as well.

**Fix:** Same as CR-01 — add `es` to the locale regex.

---

### WR-03: `sendMessageSchema.code` has no minimum length

**File:** `src/_actions/public/message.action.ts:11`

**Issue:**

```ts
code: z.string(),
```

An empty string passes Zod validation. The DB comparison `report.trackingCode !== ''` will always deny access (tracking codes are never empty strings), so there is no functional security gap today. However, the schema does not express the invariant — if tracking code generation ever changes, or the field is reused elsewhere, this silent reliance on DB-level rejection is fragile.

**Fix:**

```ts
code: z.string().min(1, 'Código é obrigatório'),
```

---

## Info

### IN-01: `register.action.test.ts` covers only the happy-path rejection

**File:** `src/_actions/public/register.action.test.ts`

**Issue:** A single test exercises the "always throws" behavior. Schema validation errors (e.g., mismatched `confirmPassword`, invalid email) are not tested. If the schema is updated in the future, there is no regression coverage.

**Fix:** Add at least one schema-validation test to confirm the action rejects malformed input with `validationErrors`, not `serverError`.

---

### IN-02: `use-register.ts` is live dead code

**File:** `src/_hooks/public/use-register.ts`

**Issue:** The hook wires up a permanently-disabled server action. The `/register` route is blocked at the proxy, so no component should be calling this hook in practice. If the `/register` page still exists in the file system, it will render a form that always fails — poor UX for anyone who reaches it (e.g., via direct navigation, bookmarks, or the `es`-locale bypass in CR-01).

**Fix:** Either delete the page and hook, or keep them only in a clearly-commented disabled state with a visible error message on the page itself rather than a form.

---

_Reviewed: 2026-06-30T18:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
