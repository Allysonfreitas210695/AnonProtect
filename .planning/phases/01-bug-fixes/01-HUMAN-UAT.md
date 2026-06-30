---
status: partial
phase: 01-bug-fixes
source: [01-VERIFICATION.md]
started: 2026-06-30T10:55:00Z
updated: 2026-06-30T10:55:00Z
---

## Current Test

[aguardando testes manuais]

## Tests

### 1. Rastreamento na UI — formulário aceita AP-YYYY-XXXX

expected: campo de busca aceita código no formato `AP-2024-ABCD` sem exibir erro de validação; denúncia é encontrada corretamente
result: [pending]

### 2. Filtro de país SUPERVISOR — escopo prevalece sobre searchParam de URL

expected: usuário SUPERVISOR vê apenas denúncias do seu país mesmo quando a URL contém `?country=OUTRO_PAIS`
result: [pending]

### 3. Página ToS nos 3 locales — renderização real sem erro de hidratação

expected: `/pt-BR/terms-of-service`, `/en/terms-of-service` e `/es/terms-of-service` exibem os 4 cards de conteúdo sem erro de hidratação no console do browser
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
