---
status: complete
---

# Resumo: UI do painel admin não atualizava após mutações de denúncia

Encontrado durante teste E2E manual completo (Playwright) do painel administrativo, ao mudar o status de uma denúncia e observar que o badge de status no cabeçalho continuava mostrando o valor antigo até um reload manual.

## Causa raiz

Nenhuma das server actions em `src/_actions/admin/report.action.ts` chamava `revalidatePath` após a mutação — diferente do padrão já estabelecido em `message.action.ts` (público) e `category.action.ts` (admin). Como a página de detalhe da denúncia é renderizada no servidor, sem invalidação o Next.js Router Cache mantinha o payload RSC antigo.

## Correção

Adicionado `revalidatePath` em todas as 7 actions de `report.action.ts`:
`updateReportStatusAction`, `sendAdminReplyAction`, `createInvestigationNoteAction`, `deleteInvestigationNoteAction`, `forwardReportAction`, `batchUpdateReportStatusAction`, `deleteReportAction`.

## Verificação

- `npx tsc --noEmit`: sem erros
- `npx eslint`: sem erros
- `npx vitest run src/_actions/admin/report.action.test.ts`: 2/2 passando (após adicionar mock de `next/cache`)
- Validação visual via Playwright MCP: mudança de status "Em Análise" → "Resolvido" refletida instantaneamente no badge do cabeçalho e na timeline de atividades, com toast de confirmação, sem necessidade de reload

## Não corrigido (fora de escopo)

- `npm test` também executa os arquivos `.spec.ts` da pasta `e2e/` (specs do Playwright) como se fossem testes Vitest, causando falhas — problema de configuração pré-existente (`vitest.config.ts` não exclui `e2e/`), não introduzido por esta mudança.
- `tracking.test.ts > should generate unique codes`: teste flaky pré-existente (colisão probabilística ao gerar 100 códigos), não relacionado.
