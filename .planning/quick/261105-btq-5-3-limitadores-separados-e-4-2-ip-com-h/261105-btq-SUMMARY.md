# Quick 261105-btq Summary

Rate limit: IP vira HMAC-SHA256 (RATE_LIMIT_SECRET, fallback AUTH_SECRET com dominio `anonprotect-ratelimit-v1`), analytics off, RateLimitGuard removido, IP fora dos logs.

## Commits

- 95f30ee test: testes de hash
- c53ae8e feat: HMAC + analytics:false
- 893dd9d fix: remove RateLimitGuard/RateLimitError e namespace i18n RateLimit
- 7ec3f57 fix: remove ip do log s3 + docs CLAUDE.md

## Deviations

- Base nao continha o quick 261105-bo7 (sem prop `variant` no ReportCard); editado o arquivo atual.
- PLAN estava so no checkout principal (nao commitado); lido de la.

## Verification

npm test (195 ok), lint (0 erros, 5 warnings pre-existentes), tsc ok.
