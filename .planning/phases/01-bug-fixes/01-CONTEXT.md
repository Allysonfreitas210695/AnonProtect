# Phase 1: Bug Fixes - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminar 4 defeitos conhecidos para que o fluxo principal do denunciante (submissão + rastreamento via código) e as funções administrativas operem sem bugs documentados. Nenhuma nova funcionalidade é adicionada nesta fase.

</domain>

<decisions>
## Implementation Decisions

### BUG-01 — Tracking Code Validator

- **D-01:** Atualizar `isValidTrackingCode()` em `src/_shared/utils/validators.ts` para aceitar o formato `AP-YYYY-XXXX` (regex: `AP-\d{4}-[A-Z0-9]{4}`). O generator (`src/_shared/utils/tracking.ts`) não muda — dados existentes estão no formato AP e devem continuar válidos.
- **D-02:** Atualizar `src/_shared/utils/validators.test.ts` — remover o comentário de TODO `// This is the new format, but validator expect RPT-` e atualizar as asserções para o formato AP correto.

### BUG-02 — Country Filter em `getReportsPaginated()`

- **D-03:** Consolidar em um único parâmetro. Remover o parâmetro duplicado (`country` ou `filterCountry`) do contrato de `getReportsPaginated()` em `src/_modules/admin/admin.query.ts`. Um único parâmetro de filtro por país elimina a ambiguidade e o risco de sobrescrita silenciosa. Verificar e atualizar os callers para usar o parâmetro canônico.

### BUG-03 — Página `/terms-of-service`

- **D-04:** Criar página com conteúdo real TCC-adequado — texto genérico de Termos de Uso com seções padrão (objeto da plataforma, condições de uso, privacidade/LGPD, limitação de responsabilidade, contato). Adequado para a apresentação da banca.
- **D-05:** Reutilizar o mesmo layout e estrutura visual da página `privacy-policy` existente em `src/app/[locale]/(public)/privacy-policy/`. Não criar componentes de layout novos.
- **D-06:** Adicionar chaves i18n nos três arquivos `messages/{pt-BR,en,es}.json` para todo texto visível na página.

### BUG-04 — Role Check Redundante em `deleteReportAction`

- **D-07:** Remover o bloco `if (user.role !== 'ADMIN')` interno em `src/_actions/admin/report.action.ts:106-119`. O `adminActionClient` já garante essa verificação — a checagem interna é código morto que gera confusão durante manutenção.

### Claude's Discretion

- Ordem exata das seções do conteúdo da ToS (objeto, condições, privacidade, responsabilidade, contato) — Claude define com base em boas práticas de ToS para plataformas de denúncia.
- Parâmetro canônico a manter no merge do BUG-02 (se `country` ou `filterCountry`) — Claude escolhe o mais semântico dado o contexto dos callers.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Arquivos a modificar (BUG-01)

- `src/_shared/utils/validators.ts` — função `isValidTrackingCode()` a corrigir
- `src/_shared/utils/tracking.ts` — gerador de código (referência para o formato correto, não muda)
- `src/_shared/utils/validators.test.ts` — testes a atualizar com formato AP

### Arquivos a modificar (BUG-02)

- `src/_modules/admin/admin.query.ts` — linhas 103-107, parâmetros duplicados de country

### Arquivos de referência (BUG-03)

- `src/app/[locale]/(public)/privacy-policy/` — estrutura e layout a replicar para ToS
- `messages/pt-BR.json`, `messages/en.json`, `messages/es.json` — adicionar chaves ToS

### Arquivos a modificar (BUG-04)

- `src/_actions/admin/report.action.ts` — linhas 106-119, remoção do role check interno

### Requisitos

- `.planning/REQUIREMENTS.md` §Bugs Críticos (BUG-01 a BUG-04)
- `.planning/ROADMAP.md` §Phase 1

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- Layout de `privacy-policy`: pode ser reaproveitado diretamente para a página ToS (BUG-03)
- `adminActionClient` em `src/_shared/utils/safe-action.ts`: já garante role ADMIN — prova de que o check em BUG-04 é redundante

### Established Patterns

- Páginas públicas ficam em `src/app/[locale]/(public)/` com arquivos `page.tsx` e `_components/` locais
- Textos i18n obrigatórios nos três arquivos `messages/*.json` antes de qualquer PR
- Correções de utilitários devem vir acompanhadas de atualização dos testes co-localizados

### Integration Points

- O link quebrado da ToS está em `src/app/[locale]/(auth)/register/page.tsx:112` — após criar a rota, o link passa a funcionar sem mudança no componente de registro
- `getReportsPaginated()` é chamado por Server Actions do painel admin — verificar callers antes de alterar o contrato de parâmetros

</code_context>

<specifics>
## Specific Ideas

- ToS deve ter aparência profissional adequada para banca de TCC — não um stub óbvio
- O validator corrigido deve ser estritamente `AP-\d{4}-[A-Z0-9]{4}` para corresponder exatamente ao que `tracking.ts` gera

</specifics>

<deferred>
## Deferred Ideas

Nenhuma — a discussão se manteve dentro do escopo da Fase 1.

</deferred>

---

_Phase: 1-Bug Fixes_
_Context gathered: 2026-06-30_
