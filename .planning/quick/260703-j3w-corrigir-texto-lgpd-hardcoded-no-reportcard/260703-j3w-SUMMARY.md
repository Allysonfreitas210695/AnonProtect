---
status: complete
---

# Resumo: Bugs encontrados em teste E2E manual (Playwright) — TCC

Durante um teste E2E completo do fluxo (nova denúncia → tracking público → login admin → detalhe da denúncia) com Playwright, feito para gerar screenshots do TCC, dois bugs reais foram encontrados e corrigidos.

## Bugs corrigidos

1. **Texto hardcoded/typo no ReportCard**: badge exibia "PROJETADO PELA LGPD" (typo) e os botões "Ver Originais"/"Ocultar Originais" estavam hardcoded em português, ignorando i18n. Corrigido: chaves `protectedByLgpd`, `showOriginal`, `hideOriginal` adicionadas ao namespace `ReportCard` em `pt-BR.json`, `en.json` e `es.json`; componente atualizado para usar `t()`.

2. **Link "Voltar" duplicando locale (404)**: em `/admin/report/[id]`, o `Link` (de `@/i18n/navigation`, que já localiza automaticamente) recebia `href={`/${locale}/admin/report`}`, gerando `/pt-BR/pt-BR/admin/report` → 404. Corrigido para `href="/admin/report"`, mesmo padrão usado em outros links do admin.

## Não é bug

- Categoria da denúncia mudando de "Assédio Moral" (selecionado pelo denunciante) para "Assédio Sexual" após o processamento: comportamento esperado da reclassificação automática por IA (`analyzeReport`), documentado no CLAUDE.md.
- Pequeno atraso (~2s) para a mensagem enviada aparecer na lista de comunicação: sem erros no console, resolvido após revalidação; não investigado a fundo por não bloquear o fluxo.
- 404 do `favicon.png` e warning de SSL do `pg`: cosméticos/infra, fora de escopo.

## Verificação

- `npx tsc --noEmit`: sem erros
- `npx eslint` nos arquivos alterados: sem erros
- Validação visual via Playwright MCP (dev server local) confirmando os dois fluxos corrigidos

## Commit

Aplicado em commit único junto com esta sessão de testes E2E.
