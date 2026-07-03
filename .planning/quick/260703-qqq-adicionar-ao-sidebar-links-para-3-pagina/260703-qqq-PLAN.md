---
phase: quick-260703-qqq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/[locale]/(admin)/admin-layout-client.tsx
  - messages/pt-BR.json
  - messages/en.json
  - messages/es.json
autonomous: true
requirements: [SIDEBAR-ORPHAN-LINKS]

must_haves:
  truths:
    - 'Any authenticated admin role sees an Analytics link in the sidebar pointing to /admin/analytics'
    - 'Only ADMIN role sees Status and Audit Log links in the sidebar (same conditional as Settings)'
    - 'Clicking each new link navigates to the corresponding working page'
    - 'All three messages/*.json files remain valid JSON with status and auditLog keys in the Sidebar namespace'
  artifacts:
    - path: 'src/app/[locale]/(admin)/admin-layout-client.tsx'
      provides: 'navItems entries for analytics, status, audit-log with lucide icons'
      contains: '/admin/analytics'
    - path: 'messages/pt-BR.json'
      provides: 'Sidebar.status and Sidebar.auditLog keys'
      contains: 'auditLog'
  key_links:
    - from: 'src/app/[locale]/(admin)/admin-layout-client.tsx'
      to: 'messages Sidebar namespace'
      via: "t('status'), t('auditLog'), t('analytics')"
      pattern: "t\\('(status|auditLog|analytics)'\\)"
---

<objective>
Add sidebar links for 3 orphaned admin pages (analytics, status, audit-log) that are fully functional but currently only reachable by typing the URL.

Purpose: Make working admin pages discoverable via the navigation menu.
Output: Updated navItems array + i18n keys in all 3 locale files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/[locale]/(admin)/admin-layout-client.tsx

Notes from investigation:

- The REAL admin sidebar is `admin-layout-client.tsx`. Do NOT touch `src/_components/shared/sidebar.tsx` (dead code, not imported anywhere).
- Current lucide-react imports: LayoutDashboard, FileText, Settings, LogOut, Menu, X, ShieldCheck, User.
- `analytics` key ALREADY exists in Sidebar namespace of all 3 message files (value: "Análise"/"Analytics"/"Análisis"). Only `status` and `auditLog` need to be added.
- Existing conditional pattern for ADMIN-only items: `...(user.role === 'ADMIN' ? [ {...} ] : [])` (the Settings entry).
- Typecheck command: `npx tsc --noEmit`. Lint: `npm run lint`.
  </context>

<tasks>

<task type="auto">
  <name>Task 1: Add status and auditLog i18n keys to all 3 locale files</name>
  <files>messages/pt-BR.json, messages/en.json, messages/es.json</files>
  <action>In each file's `Sidebar` namespace, add two keys next to the existing `analytics` key. Keep `analytics` as-is (already present). Add:
  - pt-BR: `"status": "Status do Sistema"`, `"auditLog": "Log de Auditoria"`
  - en: `"status": "System Status"`, `"auditLog": "Audit Log"`
  - es: `"status": "Estado del Sistema"`, `"auditLog": "Registro de Auditoría"`
  Preserve existing key order and formatting. Do not modify other namespaces.</action>
  <verify>
    <automated>node -e "['pt-BR','en','es'].forEach(l=>{const s=require('./messages/'+l+'.json').Sidebar; if(!s.status||!s.auditLog||!s.analytics) throw new Error('missing key in '+l)}); console.log('ok')"</automated>
  </verify>
  <done>All three JSON files parse successfully and each Sidebar namespace has analytics, status, and auditLog keys.</done>
</task>

<task type="auto">
  <name>Task 2: Add analytics/status/audit-log entries to navItems</name>
  <files>src/app/[locale]/(admin)/admin-layout-client.tsx</files>
  <action>Add three lucide-react icons to the existing import from 'lucide-react': `BarChart3` (analytics), `Activity` (status), `History` (audit-log).

In the `navItems` array:

- Add an `analytics` entry visible to ALL authenticated roles (place it alongside dashboard/report/profile, before the ADMIN conditional spread): `{ href: '/admin/analytics', label: t('analytics'), icon: BarChart3 }`.
- Extend the existing `...(user.role === 'ADMIN' ? [ ... ] : [])` spread so the ADMIN-only array ALSO contains the status and audit-log entries (keep Settings): add `{ href: '/admin/status', label: t('status'), icon: Activity }` and `{ href: '/admin/audit-log', label: t('auditLog'), icon: History }`.

Use `t('...')` (t = useTranslations('Sidebar'), already in the component). Do not change the duplication between /admin and /admin/dashboard (out of scope). Do not touch src/\_components/shared/sidebar.tsx.</action>
<verify>
<automated>npx tsc --noEmit && npm run lint</automated>
</verify>
<done>navItems has /admin/analytics (all roles) plus /admin/status and /admin/audit-log inside the ADMIN-only spread; new icons imported; tsc and lint pass.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (no type errors)
- `npm run lint` passes
- All 3 messages/*.json remain valid JSON with status + auditLog keys
</verification>

<success_criteria>

- Analytics link visible to every authenticated admin role, linking to /admin/analytics
- Status and Audit Log links visible only to ADMIN role (same conditional as Settings)
- No changes to dead-code sidebar.tsx or the /admin vs /admin/dashboard duplication
  </success_criteria>

<output>
Create `.planning/quick/260703-qqq-adicionar-ao-sidebar-links-para-3-pagina/260703-qqq-SUMMARY.md` when done
</output>
