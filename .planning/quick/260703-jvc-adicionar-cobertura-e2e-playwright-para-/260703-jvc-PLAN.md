---
phase: quick-260703-jvc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - e2e/helpers/report.ts
  - e2e/fixtures/evidence.pdf
  - e2e/ai-analysis.spec.ts
  - e2e/attachment-upload.spec.ts
  - e2e/chat.spec.ts
autonomous: true
requirements: [QUICK-260703-jvc]

must_haves:
  truths:
    - 'A new-report submission E2E helper exists and returns the tracking code, reused by all three specs (no duplicated form-fill logic)'
    - 'AI auto-analysis spec asserts the graceful-degradation contract: report is created and both public tracking and admin detail render without breaking, regardless of live Gemini output'
    - 'Attachment spec attaches a fixture file via setInputFiles, submits, and asserts the report is created and the filename is observable'
    - 'Chat spec exercises the anonymous->admin->anonymous message round trip with hard condition-based assertions'
    - 'npx tsc --noEmit passes and npx playwright test --list shows the new tests without errors'
  artifacts:
    - path: 'e2e/helpers/report.ts'
      provides: 'submitReportViaForm(page, opts) shared helper returning trackingCode'
      exports: ['submitReportViaForm']
    - path: 'e2e/fixtures/evidence.pdf'
      provides: 'Tiny fixture file for upload test'
    - path: 'e2e/ai-analysis.spec.ts'
      provides: 'AI graceful-degradation E2E coverage'
    - path: 'e2e/attachment-upload.spec.ts'
      provides: 'Attachment upload E2E coverage'
    - path: 'e2e/chat.spec.ts'
      provides: 'Whistleblower<->admin chat round-trip E2E coverage'
  key_links:
    - from: 'e2e/attachment-upload.spec.ts'
      to: 'e2e/helpers/report.ts'
      via: 'import submitReportViaForm'
      pattern: 'submitReportViaForm'
    - from: 'e2e/chat.spec.ts'
      to: 'e2e/helpers/auth.ts'
      via: 'import loginAdmin'
      pattern: 'loginAdmin'
---

<objective>
Extend the Playwright E2E suite (`e2e/*.spec.ts`) to cover three flows currently untested: AI auto-analysis (graceful degradation), attachment upload, and the whistleblower<->admin chat round trip.

Purpose: Close the E2E coverage gap for the app's three highest-value dynamic flows so the TCC suite exercises real user journeys, not just static page renders.
Output: One shared submission helper, one fixture file, and three new spec files. Test-only, additive — NO changes to `src/`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

# Existing E2E patterns to mirror (style: no semicolons, single quotes, 2-space indent)

@e2e/helpers/auth.ts
@e2e/report.spec.ts
@e2e/admin-reports.spec.ts
@playwright.config.ts

# App surface under test (READ ONLY — do not modify)

@src/app/[locale]/(auth)/report/new/\_components/form.tsx
@src/\_hooks/public/use-new-report.ts
@src/\_hooks/public/use-s3-upload.ts
@src/\_schemas/report.ts
@src/app/[locale]/(auth)/report/[code]/\_components/message-form.tsx
@src/app/[locale]/(admin)/admin/report/[id]/\_components/admin-message-form.tsx
@src/app/[locale]/(admin)/admin/report/[id]/\_components/evidence-gallery.tsx
@src/\_modules/report/report.data.ts
</context>

<key_facts>
Facts extracted from source — use these to write deterministic locators; do not re-derive.

- New report form lives at `/pt-BR/report/new`. On successful submit `useNewReport` redirects to `/report/success?code=<TRACKING_CODE>` (locale-prefixed → `/pt-BR/report/success?code=...`). The tracking code is the `code` query param — parse it from `page.url()`.
- Required fields (reportSchema): `categoryId` (uuid), `description` (min 10 chars), `country` (auto-set to "Brasil" by a useEffect when locale is pt-BR), `acceptTerms` (must be true), `acceptAi` (must be true). Location fields are optional.
- Category is a shadcn/Radix `Select`, NOT a native `<select>`. Open with the first `combobox` role and pick the first `option`. The country Select is disabled under pt-BR, so `getByRole('combobox').first()` is the category trigger. Placeholder text: "Selecione o tipo...".
- Description is a `Textarea` with placeholder "Descreva o ocorrido com o máximo de detalhes possível...".
- Consent checkboxes are Radix (role `checkbox`). Exact pt-BR labels: acceptTerms = "Li e aceito os termos de privacidade..." acceptAi = "Autorizo o processamento da minha denúncia por Inteligência Artificial...". A third checkbox (id `no-number`) exists in the number field — do NOT rely on positional order alone; locate the two consent checkboxes relative to their label text.
- File input: `<input type="file" multiple>` inside the "Evidências (Opcional)" block. Use `page.locator('input[type="file"]').setInputFiles(path)`. `accept` is advisory; setInputFiles bypasses it. Prefer a `.pdf` fixture (avoids the client-side image canvas re-encode path in `stripMetadata`).
- Submit button text = "Enviar Denúncia" (changes to "Enviando anexos..."/"Analisando denúncia..." while busy).
- Turnstile widget only renders when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; the server only requires a token when `TURNSTILE_SECRET_KEY` is set. Assume the E2E env has neither (submission proceeds without captcha). If a Turnstile iframe is present in the target env, the test should skip gracefully — but do NOT add silent isVisible guards; prefer relying on the no-turnstile dev env.
- `processAiAnalysis` (report.data.ts) is fire-and-forget and catches its own errors — report creation ALWAYS succeeds whether or not Gemini responds. This is the degradation contract the AI spec asserts.
- Upload path: `useS3Upload.uploadFiles` catches errors and returns `[]` (report still submits without attachment) when S3 is not configured. STATE.md confirms AWS is active in this environment, so treat S3 as available for the admin-side filename assertion.
- Public tracking page: `/pt-BR/report/<code>`. Message input placeholder "Digite sua mensagem...", submit button "Enviar". Messages render in `MessageList`.
- Admin reply form (`AdminMessageForm`): input placeholder "Responder como Admin...", submit button "Enviar".
- Admin finds a report by tracking code: reports list search input (placeholder matches /buscar|search|código/i) → fill code → Enter → click "ver detalhes" link. See `e2e/admin-reports.spec.ts` tests 02/05 for the exact navigation pattern.
- Admin evidence: `EvidenceGallery` renders each `attachment.fileName` as visible text under the "Evidências Anexadas" card.
- Message content is encrypted at rest but decrypted in the query layer, so plaintext message text is visible in both UIs.
  </key_facts>

<tasks>

<task type="auto">
  <name>Task 1: Shared submit helper + AI graceful-degradation spec</name>
  <files>e2e/helpers/report.ts, e2e/ai-analysis.spec.ts</files>
  <action>
Create `e2e/helpers/report.ts` exporting an async `submitReportViaForm(page, opts?)` helper where opts = `{ description?: string; filePath?: string }`. The helper: navigates to `/pt-BR/report/new` (waitUntil 'load'); opens the category Select via `page.getByRole('combobox').first().click()` and clicks the first `page.getByRole('option')`; fills the description Textarea (default a >10-char string like "Denúncia de teste automatizado E2E via Playwright.") using the placeholder locator or `page.locator('textarea')`; if `opts.filePath` is provided, calls `page.locator('input[type="file"]').setInputFiles(opts.filePath)`; checks the two consent checkboxes by locating each relative to its pt-BR label text (acceptTerms / acceptAi) — use `page.locator` scoping so the `no-number` checkbox is never toggled; clicks the "Enviar Denúncia" submit button; waits for URL `/\/report\/success/` with a generous timeout (e.g. 20000); parses the `code` query param from `page.url()` and returns it. Add a hard assertion inside the helper that the parsed code is a non-empty string.

Create `e2e/ai-analysis.spec.ts`: a describe block "AI Auto-Analysis (Graceful Degradation)". Test that submits a report via the helper, asserts a tracking code was returned, then navigates to the public tracking page `/pt-BR/report/<code>` and asserts the report status/history UI is visible (e.g. the Tracking title "Acompanhamento de Denúncia" and the report card render — mirror assertion style in report.spec.ts). This proves fire-and-forget AI analysis never blocks or breaks report creation or the tracking view, regardless of live Gemini output. Favor deterministic assertions over asserting AI-produced fields (redactedDescription/category may be absent when the API key is missing in CI).

Style: no semicolons, single quotes, 2-space indent, `import { test, expect } from '@playwright/test'`, import the helper with a relative path.
</action>
<verify>
<automated>cd "$PWD" && npx playwright test e2e/ai-analysis.spec.ts --list && npx tsc --noEmit</automated>
</verify>
<done>`e2e/helpers/report.ts` exports `submitReportViaForm`; `e2e/ai-analysis.spec.ts` lists at least one test via `--list`; tsc passes; no fixed `waitForTimeout` used, no `if (await x.isVisible())` silent-pass guards.</done>
</task>

<task type="auto">
  <name>Task 2: Attachment upload spec + fixture</name>
  <files>e2e/fixtures/evidence.pdf, e2e/attachment-upload.spec.ts</files>
  <action>
Create a tiny valid fixture file `e2e/fixtures/evidence.pdf` (a minimal well-formed PDF is sufficient — a few hundred bytes; use the Write tool or a small node/printf snippet to emit valid `%PDF-1.4 ... %%EOF` content). Keep it small.

Create `e2e/attachment-upload.spec.ts`: describe "Attachment Upload". Test that calls `submitReportViaForm(page, { filePath: path.resolve(__dirname, 'fixtures/evidence.pdf') })` (import `path` and the helper). Before submit, the helper attaches the file; add an assertion in the spec (or extend by re-navigating is unnecessary) that the report was created (tracking code returned, non-empty). Then log in as admin via `loginAdmin` from `e2e/helpers/auth.ts`, navigate to the reports list, search for the returned tracking code, open "ver detalhes", and assert the attachment filename "evidence.pdf" is visible in the EvidenceGallery (`expect(page.getByText('evidence.pdf')).toBeVisible({ timeout })`). Reuse the admin navigation pattern from `e2e/admin-reports.spec.ts` (search input → Enter → ver detalhes link). Do NOT duplicate login code — use the shared helper. Use hard `expect(...).toBeVisible({ timeout })` assertions, no silent isVisible guards.

Note the admin-side filename assertion depends on S3 being configured in the E2E env (STATE.md confirms AWS is active). The client-side attach (setInputFiles) plus successful submission is always deterministic; the evidence-gallery filename is the end-to-end confirmation.

Style: no semicolons, single quotes, 2-space indent.
</action>
<verify>
<automated>cd "$PWD" && test -f e2e/fixtures/evidence.pdf && npx playwright test e2e/attachment-upload.spec.ts --list && npx tsc --noEmit</automated>
</verify>
<done>Fixture exists and is a valid PDF; spec lists a test; uses `setInputFiles` and `loginAdmin`; asserts the filename in the admin evidence gallery with a real `toBeVisible` assertion; tsc passes.</done>
</task>

<task type="auto">
  <name>Task 3: Whistleblower<->admin chat round-trip spec</name>
  <files>e2e/chat.spec.ts</files>
  <action>
Create `e2e/chat.spec.ts`: describe "Chat Round Trip (Whistleblower <-> Admin)". Use two isolated browser contexts to keep the anonymous and admin sessions separate — create them via `browser.newContext()` (accept `{ browser }` in the test) so the admin login does not leak into the anonymous tracking view.

Flow:
(a) In the anonymous context page, call `submitReportViaForm(anonPage)` to submit a report and capture the tracking code.
(b) Navigate the anon page to `/pt-BR/report/<code>`, type a unique message (e.g. `Mensagem do denunciante ${Date.now()}`) into the input with placeholder "Digite sua mensagem...", click the "Enviar" button, and assert the message text becomes visible in the MessageList (`expect(anonPage.getByText(msg)).toBeVisible({ timeout })`).
(c) In the admin context page, `loginAdmin(adminPage)`, navigate to the reports list, search the tracking code, open "ver detalhes", and assert the whistleblower's message text is visible. Then type a unique reply (e.g. `Resposta do admin ${Date.now()}`) into the AdminMessageForm input (placeholder "Responder como Admin...", submit button "Enviar"), submit, and assert the reply becomes visible in the admin MessageList.
(d) Back in the anon page, reload `/pt-BR/report/<code>` and assert the admin's reply text is now visible (`toBeVisible({ timeout })`).

Close both contexts at the end. Use only condition-based `expect(...).toBeVisible/toHaveText/toContainText` assertions with generous timeouts — NO fixed `waitForTimeout`, NO silent isVisible guards (quick task 260703-jn0 removed those; do not reintroduce). Import `loginAdmin` from `./helpers/auth` and `submitReportViaForm` from `./helpers/report`.

Style: no semicolons, single quotes, 2-space indent.
</action>
<verify>
<automated>cd "$PWD" && npx playwright test e2e/chat.spec.ts --list && npx tsc --noEmit</automated>
</verify>
<done>Spec lists a test; exercises anon-send -> admin-see+reply -> anon-see round trip across two contexts; uses shared auth + report helpers; only condition-based waits; tsc passes.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary              | Description                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| test env → dev server | E2E hits a live `npm run dev` server with real DB/S3; specs must not commit secrets or fixtures containing PII |

## STRIDE Threat Register

| Threat ID | Category               | Component                 | Disposition | Mitigation Plan                                                                |
| --------- | ---------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------ |
| T-jvc-01  | Information Disclosure | e2e/fixtures/evidence.pdf | mitigate    | Fixture is synthetic dummy content, no real PII                                |
| T-jvc-SC  | Tampering              | npm/pip/cargo installs    | accept      | No new dependencies; test-only additive change using existing @playwright/test |

</threat_model>

<verification>
- `npx tsc --noEmit` passes with the new e2e files present.
- `npx playwright test --list` enumerates all three new specs without parse/type errors.
- No `waitForTimeout` and no `if (await x.isVisible())` guards in the new specs (grep: `grep -rn "waitForTimeout\|if (await.*isVisible" e2e/ai-analysis.spec.ts e2e/attachment-upload.spec.ts e2e/chat.spec.ts` returns nothing).
- Login is done only via `e2e/helpers/auth.ts` (no inline credential fills in the new specs).
- If the E2E env (live dev server + seeded DB) is available, `npx playwright test e2e/ai-analysis.spec.ts e2e/attachment-upload.spec.ts e2e/chat.spec.ts` passes.
</verification>

<success_criteria>

- Three new spec files plus one shared helper and one fixture exist under `e2e/`.
- Form-submission logic is centralized in `submitReportViaForm` (no duplication across specs); admin login reuses `loginAdmin`.
- AI spec asserts the graceful-degradation contract deterministically; attachment spec attaches via `setInputFiles` and asserts the filename in the admin evidence gallery; chat spec completes the anon↔admin round trip.
- `npx tsc --noEmit` and `npx playwright test --list` both succeed.
- No `src/` files modified.
  </success_criteria>

<output>
Create `.planning/quick/260703-jvc-adicionar-cobertura-e2e-playwright-para-/260703-jvc-SUMMARY.md` when done.
</output>
