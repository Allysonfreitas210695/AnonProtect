# Phase 3: Chat - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 3-chat
**Areas discussed:** Paginação de mensagens, Destinatários do email, Conteúdo do email

---

## Paginação de Mensagens

| Option                        | Description                                                                                                                                      | Selected |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Remover o limite inteiramente | TCC com poucos usuários — threads dificilmente terão >50 mensagens. Simplesmente remover o `take: 50` é suficiente e elimina complexidade de UI. | ✓        |
| Botão 'Carregar mais'         | Busca os primeiros N, exibe botão para carregar mais. Mais complexo — requer Server Action adicional com cursor e estado no cliente.             |          |

**User's choice:** Remover o limite inteiramente  
**Notes:** A decisão foi tomada considerando que o contexto TCC não justifica complexidade adicional de paginação de UI. O lado público (`getReportByCode`) já não tem cap — tornar o admin consistente.

---

## Destinatários do Email

| Option                                 | Description                                                                                                      | Selected |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| Admin atribuído ao relatório           | Notifica apenas o `assignedTo`. Se não houver admin atribuído, não envia email. Evita spam para todos os admins. | ✓        |
| Todos os admins do sistema             | Busca todos os usuários com role=ADMIN e envia para cada um. Garante que alguém receba, mas pode ser ruidoso.    |          |
| Admin atribuído ou todos se não houver | Se `assignedTo` existe, notifica apenas ele. Senão, notifica todos os admins. Lógica de fallback mais completa.  |          |

**User's choice:** Admin atribuído ao relatório  
**Notes:** Comportamento limpo — sem email se não há assignee. Incentiva atribuição de relatórios antes de eles ficarem sem acompanhamento.

---

## Conteúdo do Email

| Option                                 | Description                                                                                                                                               | Selected |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Somente notificação genérica + link    | Email diz 'nova mensagem recebida no relatório #AP-2024-XXXX, acesse o painel'. Mais seguro — conteúdo sensível não sai pelo email. Consistente com LGPD. | ✓        |
| Incluir resumo da mensagem (100 chars) | Mostra os primeiros 100 caracteres da mensagem no email para facilitar triagem. Exposição potencial de dados se email for interceptado.                   |          |

**User's choice:** Somente notificação genérica + link  
**Notes:** Consistente com a abordagem LGPD do projeto — dados sensíveis ficam no painel, email apenas notifica.

---

## Degradação Gracíosa do SES

| Option                   | Description                                                                                                            | Selected |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| Degradar silenciosamente | Se `sesClient` é null ou envio falha, loga o erro e a action continua. A mensagem é salva com sucesso mesmo sem email. | ✓        |
| Você decide              | Claude determina o comportamento correto de degradação com base nos padrões existentes.                                |          |

**User's choice:** Degradar silenciosamente  
**Notes:** Consistente com o padrão do projeto (S3 retorna null quando sem credenciais).

---

## Claude's Discretion

- Subject line do email, formato HTML vs. texto plano
- Localização da função `sendEmail` no arquivo `src/_shared/lib/aws.ts`
- Construção exata do link no corpo do email

## Deferred Ideas

None — discussion stayed within phase scope.
