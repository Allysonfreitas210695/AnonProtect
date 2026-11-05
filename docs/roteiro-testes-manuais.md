# Roteiro de testes manuais (produção)

Ambiente: https://anon-protect.vercel.app
Motivo: o envio de denúncia exige a verificação humana do Cloudflare Turnstile, que recusa navegadores automatizados. Estes casos substituem os 4 testes E2E pulados em produção.

Use o navegador normal (fora do Playwright). Login admin: `admin@sistema.com` / `admin123`.

Salve as evidências em `Downloads/AnonProtect-main/` com os nomes indicados em cada teste (ex.: `MT-03-01.png`).

| Teste | Código a usar                                                 | Evidências                     |
| ----- | ------------------------------------------------------------- | ------------------------------ |
| MT-01 | `AP-2026-2VYA-JZ38-TKNH-KYKZ` (gerado)                        | MT-01-01, MT-01-02 (recebidas) |
| MT-02 | `AP-2026-YDDE-94SV-WT9P-RQ9F` (gerado)                        | MT-02-01, MT-02-02 (recebidas) |
| MT-03 | `AP-2026-YDDE-94SV-WT9P-RQ9F`                                 | MT-03-01, MT-03-02             |
| MT-04 | `AP-2026-YDDE-94SV-WT9P-RQ9F` e `AP-2026-AAAA-BBBB-CCCC-DDDD` | MT-04-01, MT-04-02             |
| MT-05 | nenhum (não deve gerar código)                                | MT-05-01                       |

---

## MT-01 Envio com dados pessoais e anonimização pela IA

> Esta denúncia é usada nos prints do TCC. Não envie mensagens nela.

1. Abrir `/pt-BR/report/new`.
2. Tipo: **Assédio Moral**. CEP: **01310-100**. Número: **123**.
3. Descrição (copiar exatamente):
   `O diretor João Silva, CPF 123.456.789-00, me assediou durante a reunião do setor financeiro e vem solicitando favores pessoais em troca de promoções.`
4. Marcar as duas caixas, concluir o "Verify you are human" e clicar em **Enviar Denúncia**.

**Esperado:** tela "Denúncia Enviada!" com o código de rastreio (formato `AP-2026-XXXX-XXXX-XXXX-XXXX`).

5. Aguardar cerca de 1 minuto e abrir `/pt-BR/report/<código>`.

**Esperado:** o relato aparece com nome e CPF trocados por `[DADO PROTEGIDO]`.

**Evidências:** `MT-01-01.png` (formulário preenchido) e `MT-01-02.png` (tela de sucesso com o código). A anonimização foi conferida no print `track-detalhe-corrigido.png` do TCC.

- [x] Aprovado em 05/11/2026 Código: `AP-2026-2VYA-JZ38-TKNH-KYKZ`

---

## MT-02 Envio com anexo (nome genérico e sem EXIF)

1. Nova denúncia (qualquer tipo e descrição), anexando **uma foto tirada no celular** (JPG, de preferência com localização ativada) e **um PDF**.
2. Enviar (com o Turnstile) e anotar o código.
3. Entrar no painel admin, menu **Denúncias**, buscar o código e clicar em **Ver detalhes**.

**Esperado:** a seção Evidências mostra os arquivos como `anexo-1.jpg` e `anexo-2.pdf`, sem o nome original.

4. Baixar a foto pelo painel. No Windows: botão direito, **Propriedades**, aba **Detalhes**.

**Esperado:** sem câmera, data de captura ou GPS. (O PDF não é re-codificado, então seus metadados podem permanecer; essa limitação já é conhecida.)

**Evidências:** `MT-02-01.png` (formulário com os dois anexos) e `MT-02-02.png` (tela de sucesso). Lado admin conferido por script (`e2e-tcc/mt02-admin-check.spec.ts`): nomes `anexo-1.jpg` e `anexo-2.pdf`, chaves S3 com UUID e JPEG sem bloco EXIF (`FF E1`).

- [x] Aprovado em 05/11/2026 Código: `AP-2026-YDDE-94SV-WT9P-RQ9F`

---

## MT-03 Chat entre denunciante e administrador

Usar a denúncia do MT-02: `AP-2026-YDDE-94SV-WT9P-RQ9F`.

1. Em https://anon-protect.vercel.app/pt-BR/report/AP-2026-YDDE-94SV-WT9P-RQ9F, enviar a mensagem: `Mensagem de teste do denunciante`.

**Esperado:** a mensagem aparece no histórico.

2. No painel admin, abrir a mesma denúncia.

**Esperado:** a mensagem do denunciante aparece em "Comunicação com Denunciante".

3. Responder: `Resposta de teste do administrador`.
4. Voltar à página do denunciante e recarregar.

**Esperado:** a resposta do administrador aparece.

**Evidências a enviar:**

- `MT-03-01.png`: painel admin da denúncia, com a mensagem do denunciante e a sua resposta em "Comunicação com Denunciante".
- `MT-03-02.png`: página do denunciante (link acima) depois de recarregar, com as duas mensagens.

**Resultado:** o denunciante enviou "oi" (11:17), que apareceu no painel; o administrador respondeu "Resposta de teste do administrador" (11:21), e a resposta apareceu na página do denunciante após recarregar. Evidências: `MT-03-admin.png` (painel) e `MT-03-01.png` (página do denunciante com as duas mensagens).

- [x] Aprovado em 05/11/2026

---

## MT-04 Rastreio por código

1. Abrir `/pt-BR/report/track`, colar o código `AP-2026-YDDE-94SV-WT9P-RQ9F` e clicar em **Acessar**.

**Esperado:** abre a página da denúncia com o status.

2. Repetir com o código inválido `AP-2026-AAAA-BBBB-CCCC-DDDD`.

**Esperado:** mensagem de denúncia não encontrada, sem revelar se o código existe.

**Evidências a enviar:**

- `MT-04-01.png`: página da denúncia aberta pelo código válido, com o status visível.
- `MT-04-02.png`: tela depois de tentar o código inválido, com a mensagem de erro.

**Resultado:** o código válido abriu a denúncia com status Pendente e o histórico (`MT-04-01.png` com o formulário e `MT-04-02.png` com a página aberta). O código inválido levou à tela "Denúncia Não Encontrada", com texto genérico que não indica se o código existe (`MT-04-03.png`, capturado por script).

- [x] Aprovado em 05/11/2026

---

## MT-05 Bloqueio sem verificação humana

1. Preencher uma nova denúncia, mas **não** concluir o "Verify you are human".
2. Clicar em **Enviar Denúncia**.

**Esperado:** o envio não é concluído (nenhum código é gerado).

**Evidência a enviar:**

- `MT-05-01.png`: formulário depois do clique em Enviar, com a caixa do Turnstile não marcada e a mensagem de erro (se houver). A URL deve continuar em `/report/new`.

**Resultado (capturado por script, `MT-05-01.png`):** sem o token do Turnstile, o clique em Enviar não gerou denúncia; a página permaneceu em `/report/new`. Observação: nenhuma mensagem foi exibida ao usuário explicando o motivo, o que é uma melhoria de usabilidade possível.

- [x] Aprovado em 05/11/2026

---

Observação: o limite de 10 denúncias por hora vale por IP. Este roteiro usa no máximo 3 envios.
