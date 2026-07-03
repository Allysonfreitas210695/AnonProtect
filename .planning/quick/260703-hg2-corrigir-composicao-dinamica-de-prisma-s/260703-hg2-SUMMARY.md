---
status: complete
---

# Resumo: Dashboard admin crashava por composição dinâmica quebrada de Prisma.sql

Bug: `getReportStats` (`src/_modules/admin/admin.query.ts`) montava a cláusula `WHERE` do `$queryRaw` da timeline diária concatenando fragmentos `Prisma.sql` via `Prisma.join` e interpolando o resultado dentro de outro `$queryRaw`. Isso gera um `Invalid prisma.$queryRaw() invocation` (`invalid input syntax for type boolean`) porque o driver serializa o `Prisma.sql` aninhado como parâmetro em vez de expandi-lo inline.

## Correção

Substituídas as 4 combinações possíveis de filtro (`startDate` + `filterCountry`, apenas `startDate`, apenas `filterCountry`, nenhum) por 4 template literals `$queryRaw` explícitos, cada um com a cláusula `WHERE` escrita diretamente (sem composição dinâmica de `Prisma.sql`).

## Verificação

- `npx tsc --noEmit`: sem erros
- `npx eslint src/_modules/admin/admin.query.ts`: sem erros
- `npx vitest run src/_modules/admin/admin.query.test.ts`: 6/6 passando
