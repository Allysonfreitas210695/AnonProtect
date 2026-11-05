# Quick 261105-c0k: Item 4.3 - anexos sem nome original e sem EXIF

Key S3 `evidence/<uuid>.<ext>`, file_name genérico gerado no servidor, validação de key no submit e re-codificação de imagens via canvas no cliente (falha bloqueia envio).

## Commits

- 2d16732 fix: key S3 com UUID, nome genérico, validação de key/ext/url
- 9be5269 feat: stripImageMetadata, hook de upload sem fallback, i18n (3 idiomas)
- (hash final) feat: galeria admin com nome genérico

## Deviations

- Task 1 commit alterou `report.data.test.ts` por engano (removeu `fileName`); corrigido no commit da Task 2.

## Limitações (para o TCC)

- (a) PDF/GIF não são re-codificados: metadados de PDF (autor, software) permanecem.
- (b) Re-codificação ocorre no cliente; cliente malicioso pode pular (mitigação parcial).
- (c) SSE não adicionado ao presign (exigiria header assinado no PUT); depende de default encryption do bucket (orquestrador verifica).
- (d) Registros antigos mantêm nome original na key e em file_name; galeria mascara na exibição; sem limpeza retroativa.

## Verificação

npm test (227 ok), npm run lint (0 erros), tsc ok.
