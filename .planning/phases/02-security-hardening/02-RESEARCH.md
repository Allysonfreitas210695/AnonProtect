# Phase 2: Security Hardening - Research

**Researched:** 2026-06-30
**Domain:** Next.js Server Actions, NextAuth v5, AES-256-GCM encryption, middleware redirects, rate limiting
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Desabilitar completamente a rota `/register` — `proxy.ts` redireciona qualquer acesso a `/register` para `/login`. Nenhuma nova conta pode ser criada publicamente.
- **D-02:** Novos SUPERVISORs são criados exclusivamente via `prisma db seed` ou Prisma Studio — sem UI de gerenciamento de usuários.
- **D-03:** Remover o link "Criar conta" da página de login completamente — não substituir por modal ou tooltip.
- **D-04:** Bloquear auto-criação via Google OAuth: adicionar verificação no callback `signIn` de `src/_shared/lib/auth.ts` — retornar `false` quando o usuário não existe no banco. Resultado: NextAuth redireciona para `/auth/error?error=AccessDenied`.
- **D-05:** Usar `encrypt()` de `src/_shared/lib/crypto.ts` em `createMessage()` e `createInvestigationNote()`.
- **D-06:** Decrypt na leitura em `*.query.ts` — `report.query.ts` para messages, `admin.query.ts` para InvestigationNotes.
- **D-07:** Falha de decrypt retorna a string sentinela `'[DECRYPT_FAILED]'` e loga com `logger.warn`.
- **D-08:** Dados históricos ignorados — sem script de migração (banco do TCC será reiniciado).
- **D-09:** `prisma/seed.ts` deve usar `encrypt()` em qualquer `Message.content` ou `InvestigationNote.content` criado.

### Claude's Discretion

- **SEC-02:** Buscar o relatório por `reportId` e verificar se `report.trackingCode === code`. Retornar `ActionError` genérico se não bater.
- **SEC-05:** Mudar linha 14 de `report.action.ts` de `return true` para `return false` quando `TURNSTILE_SECRET_KEY` ausente.
- **SEC-06:** Mudar linha 32 de `report.action.ts` para `ip.split(',')[0].trim()` antes de passar para `checkRateLimit`.

### Deferred Ideas (OUT OF SCOPE)

- UI de gerenciamento de usuários no painel admin (criar/promover SUPERVISORs via interface)
- Notificação ao admin quando um login Google bloqueado é tentado
  </user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                   | Research Support                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SEC-01 | Auto-registro público bloqueado — registro direto como SUPERVISOR sem autorização é rejeitado | Confirmar: `register.action.ts` cria `role: 'SUPERVISOR'` sem controle; `proxy.ts` não bloqueia `/register`; link existe em `login-client.tsx:121`; Google OAuth não tem `signIn` callback |
| SEC-02 | `sendMessageAction` valida que o `code` pertence ao `reportId` antes de criar a mensagem      | Confirmar: `message.action.ts` usa `reportId` e `code` mas não valida ownership; `createMessage` é chamado sem verificação                                                                 |
| SEC-03 | `Message.content` criptografado com AES-256-GCM antes de persistir                            | Confirmar: `report.data.ts:createMessage` persiste `content` em plaintext; `admin.data.ts:createAdminReply` também                                                                         |
| SEC-04 | `InvestigationNote.content` criptografado com AES-256-GCM antes de persistir                  | Confirmar: `admin.data.ts:createInvestigationNote` persiste `content` em plaintext                                                                                                         |
| SEC-05 | `verifyTurnstile()` rejeita quando `TURNSTILE_SECRET_KEY` ausente                             | Confirmar: linha 14 de `report.action.ts` tem `if (!process.env.TURNSTILE_SECRET_KEY) return true` — bypassa verificação                                                                   |
| SEC-06 | Rate limiting usa apenas o primeiro IP de `x-forwarded-for`                                   | Confirmar: linha 32 de `report.action.ts` passa o header completo (ex: `"1.2.3.4, 10.0.0.1"`) para `checkRateLimit`                                                                        |

</phase_requirements>

---

## Summary

Esta fase é puramente de hardening — sem novas funcionalidades. Seis vulnerabilidades foram confirmadas no código atual através de inspeção direta. Todas as correções reutilizam infraestrutura já existente: `encrypt()`/`decrypt()` de `crypto.ts`, padrão estabelecido em `report.query.ts`, tiered clients de `safe-action.ts`, e lógica de redirect já presente em `proxy.ts`.

A maior área de atenção é SEC-03/04 (criptografia): envolve quatro pontos de mudança interdependentes (dois writes em `*.data.ts`, dois reads em `*.query.ts`), além de atualização do teste `report.data.test.ts` que atualmente assert que `createMessage` é chamado com `content` em plaintext. SEC-01 exige quatro mudanças coordenadas (proxy, auth.ts, login UI, register action), sendo a do `signIn` callback a mais crítica para bloquear Google OAuth.

**Primary recommendation:** Implementar as seis correções em duas waves — Wave 1: SEC-05, SEC-06, SEC-01 (mudanças de uma linha e redirect); Wave 2: SEC-02, SEC-03/04 (ownership validation e encrypt/decrypt nos dois módulos).

---

## Architectural Responsibility Map

| Capability                                       | Primary Tier                        | Secondary Tier | Rationale                                                                                    |
| ------------------------------------------------ | ----------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| Bloquear rota /register                          | Middleware (proxy.ts)               | —              | Middleware intercepta antes do handler; proteção de rede-edge                                |
| Bloquear Google OAuth novo usuário               | Auth callback (auth.ts)             | —              | `signIn` callback é o único ponto de controle antes de criar sessão OAuth                    |
| Remover link /register da UI                     | Frontend (login-client.tsx)         | —              | Elemento de UI puro; sem impacto no servidor                                                 |
| Desabilitar register action                      | Server Action (register.action.ts)  | —              | Ação do servidor que ainda persiste dados; deve ser desabilitada mesmo com redirect no proxy |
| Validar ownership de mensagem                    | Server Action (message.action.ts)   | API/Backend    | Action recebe reportId + code; validação antes de chamar data layer                          |
| Criptografar Message.content (write)             | Data Layer (report.data.ts)         | —              | Padrão estabelecido: encrypt-on-write em `*.data.ts`                                         |
| Criptografar InvestigationNote.content (write)   | Data Layer (admin.data.ts)          | —              | Mesmo padrão; `createInvestigationNote` e `createAdminReply`                                 |
| Descriptografar Message.content (read)           | Query Layer (report.query.ts)       | admin.query.ts | Padrão estabelecido: decrypt-on-read em `*.query.ts`                                         |
| Descriptografar InvestigationNote.content (read) | Query Layer (admin.query.ts)        | —              | `getReportById` inclui `investigationNotes` — decrypt aqui                                   |
| Fail-closed Turnstile                            | Server Action (report.action.ts:14) | —              | Lógica inline na função `verifyTurnstile`                                                    |
| Rate limit key normalização                      | Server Action (report.action.ts:32) | —              | Linha única antes de passar IP para `checkRateLimit`                                         |

---

## Standard Stack

Nenhum pacote novo é necessário. Todas as ferramentas já estão no projeto.

### Ferramentas Reutilizadas

| Asset                      | Localização                        | Uso nesta fase                                      |
| -------------------------- | ---------------------------------- | --------------------------------------------------- |
| `encrypt()` / `decrypt()`  | `src/_shared/lib/crypto.ts`        | SEC-03/04: criptografar Message e InvestigationNote |
| `ActionError`              | `src/_shared/utils/safe-action.ts` | SEC-02: erro genérico de ownership                  |
| `logger.warn`              | `src/_shared/lib/logger.ts`        | D-07: falha de decrypt                              |
| `prisma.report.findUnique` | já usado em `report.query.ts`      | SEC-02: buscar report para validar trackingCode     |
| `NextResponse.redirect`    | já em `proxy.ts`                   | SEC-01: redirect /register → /login                 |
| NextAuth `signIn` callback | `src/_shared/lib/auth.ts`          | SEC-01: bloquear Google OAuth para novos usuários   |

## Package Legitimacy Audit

> Nenhum pacote externo novo é instalado nesta fase.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### Padrão Existente: Encrypt-on-Write / Decrypt-on-Read

Já estabelecido por `Report.description`. Copiar exatamente para Messages e InvestigationNotes:

```
Write path:  action → data.ts  → encrypt(content) → prisma.create
Read path:   query.ts → prisma.findUnique → try { decrypt(x.content) } catch { '[DECRYPT_FAILED]' + logger.warn }
```

### Padrão Existente: Proxy Redirect

```typescript
// src/proxy.ts — padrão atual para /login redirect quando não autenticado
if (!isLogged) {
  const locale = localeMatch ? localeMatch[1] : 'pt-BR'
  return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
}
```

Para SEC-01, adicionar ANTES do bloco `isPublicRoute`:

```typescript
// Bloquear /register permanentemente
if (strippedPathname.startsWith('/register')) {
  const locale = localeMatch ? localeMatch[1] : 'pt-BR'
  return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
}
```

**Atenção:** O bloco `isPublicRoute` atual lista `/register` como rota pública. Após adicionar o redirect, remover `/register` da lista `isPublicRoute` para consistência.

### Padrão Existente: signIn Callback no NextAuth

`auth.ts` já tem callbacks `session` e `jwt`. Adicionar `signIn`:

```typescript
// src/_shared/lib/auth.ts — dentro de callbacks: {}
async signIn({ user, account }) {
  if (account?.provider === 'google') {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })
    if (!existingUser) return false
  }
  return true
},
```

[CITED: NextAuth v5 docs — signIn callback retorna `false` para rejeitar; NextAuth redireciona para `/auth/error?error=AccessDenied`]

### Padrão de Ownership Validation (SEC-02)

Buscar o report antes de criar a mensagem, verificar `trackingCode`:

```typescript
// src/_actions/public/message.action.ts
import { prisma } from '@/_shared/lib/prisma'
import { ActionError } from '@/_shared/utils/safe-action'

// dentro do .action():
const report = await prisma.report.findUnique({
  where: { id: reportId },
  select: { trackingCode: true },
})

if (!report || report.trackingCode !== code) {
  throw new ActionError('Acesso negado')
}

await reportRepository.createMessage(reportId, content)
```

**Nota:** Usar mensagem genérica `'Acesso negado'` sem indicar qual campo falhou — evita information leakage.

**Alternativa via query module:** `report.query.ts` tem `getReportByCode(code)` que busca por `trackingCode`. Porém, buscar por `reportId` e checar `trackingCode` é mais direto e não faz decrypt desnecessário. Acessar `prisma` diretamente na action é aceitável para validação lightweight — o padrão de módulos é para reads/writes completos, não verificações de autorização. [ASSUMED]

### Padrão de Decrypt com Fallback (SEC-03/04, read)

Copiar exatamente do padrão existente em `report.query.ts:31-40`, adaptando para arrays:

```typescript
// Para cada message em report.messages:
const decryptedMessages = report.messages.map((msg) => {
  let content = msg.content
  try {
    content = decrypt(msg.content)
  } catch (e) {
    logger.warn({ messageId: msg.id }, 'Falha ao descriptografar mensagem')
    content = '[DECRYPT_FAILED]'
  }
  return { ...msg, content }
})
```

**Importante:** `report.query.ts:35` usa `console.warn` em vez de `logger.warn` — bug existente. Ao adicionar decrypt para messages, usar `logger.warn` (pino) corretamente conforme D-07 e convenções do projeto.

### Padrão de Encrypt (SEC-03/04, write)

```typescript
// src/_modules/report/report.data.ts — createMessage()
export async function createMessage(reportId: string, content: string) {
  return await prisma.message.create({
    data: {
      reportId,
      content: encrypt(content), // adicionar encrypt
      sender: 'USER',
    },
  })
}
```

`encrypt` já é importado em `report.data.ts` (linha 5). Nenhum import adicional necessário.

Para `admin.data.ts`, `encrypt` precisa ser importado.

### Recommended Project Structure

Nenhuma mudança estrutural. Todos os arquivos já existem — apenas modificações em arquivos existentes.

---

## Don't Hand-Roll

| Problema               | Não construir             | Usar                                            | Por quê                                                                  |
| ---------------------- | ------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Criptografia de campos | Implementação AES própria | `src/_shared/lib/crypto.ts` existente           | Já testado, usa node:crypto corretamente com IV aleatório e auth tag     |
| Ownership validation   | Lógica custom de token    | Buscar por `reportId` + comparar `trackingCode` | O `trackingCode` já é o segredo do denunciante; não criar novo mecanismo |
| Bloqueio de rota       | Proteção em page.tsx      | Redirect em `proxy.ts`                          | Middleware intercepta antes do React render; page-level é bypassável     |
| Bloquear Google OAuth  | Lógica custom em provider | Callback `signIn` nativo do NextAuth            | Único ponto garantido antes de criar sessão                              |

---

## Common Pitfalls

### Pitfall 1: `createAdminReply` também persiste `Message.content` sem encrypt

**O que acontece:** SEC-03 exige criptografia de `Message.content`. Em `report.data.ts`, apenas `createMessage` (sender USER) é mencionado. Mas `admin.data.ts:createAdminReply` também cria `prisma.message.create` com sender ADMIN — sem encrypt.
**Por que acontece:** Foco no fluxo do denunciante; o lado admin é esquecido.
**Como evitar:** Tratar `createAdminReply` como write path igual ao `createMessage` — aplicar `encrypt(content)` antes de persistir.
**Sinal de alerta:** Mensagens de admin aparecem como ciphertext bruto na UI do denunciante após SEC-03.

### Pitfall 2: `getReportById` em `admin.query.ts` inclui messages sem decrypt

**O que acontece:** `admin.query.ts:getReportById` faz `include: { messages: { ... } }` (linha 38) mas não decripta `message.content`. Após SEC-03, todos os `message.content` ficam ciphertext na UI admin.
**Por que acontece:** O decrypt de mensagens em `report.query.ts` (para o denunciante) e em `admin.query.ts` (para o admin) são dois pontos separados.
**Como evitar:** Adicionar map de decrypt em `getReportById` de `admin.query.ts` para `report.messages`, análogo ao que será feito em `report.query.ts`.

### Pitfall 3: Teste `report.data.test.ts` vai quebrar após SEC-03

**O que acontece:** `report.data.test.ts:99-109` assert que `prisma.message.create` é chamado com `content: 'hello'` em plaintext. Após `encrypt(content)` em `createMessage`, o assert esperará `content: 'encrypted_hello'` (dado o mock `encrypt: vi.fn((text) => 'encrypted_${text}')`).
**Por que acontece:** Teste foi escrito antes da criptografia existir.
**Como evitar:** Atualizar o assert para `content: 'encrypted_hello'` após aplicar a mudança.

### Pitfall 4: Teste `message.action.test.ts` precisa de mock de prisma para SEC-02

**O que acontece:** `message.action.test.ts` atual não mocka `prisma.report.findUnique`. Após adicionar a query de ownership validation na action, o teste vai falhar por tentar acessar o banco real.
**Por que acontece:** O teste foi escrito quando a action não fazia nenhuma query direta.
**Como evitar:** Adicionar mock de `@/_shared/lib/prisma` no teste de `sendMessageAction`, com `prisma.report.findUnique` retornando `{ trackingCode: 'AP-2026-TEST' }` para o caso de sucesso e `null` para o caso de rejeição.

### Pitfall 5: `/register` ainda está em `isPublicRoute` no proxy.ts após o redirect

**O que acontece:** Se adicionar o redirect para `/register` mas não remover da lista `isPublicRoute`, um usuário logado que acesse `/register` será redirecionado para `/admin` (pelo bloco `isLogged && isPublicRoute`) em vez de `/login`. Comportamento inconsistente mas não catastrófico.
**Como evitar:** Remover `/register` da lista `isPublicRoute` ao adicionar o redirect.

### Pitfall 6: `report.query.ts:35` usa `console.warn` — oportunidade de corrigir junto

**O que acontece:** O padrão existente de decrypt em `getReportByCode` usa `console.warn` (linha 35), violando a convenção do projeto (deve usar `logger.warn`).
**Como evitar:** Corrigir o `console.warn` existente ao adicionar o decrypt de messages na mesma função. Não introduzir novos `console.warn`.

### Pitfall 7: `seed.ts` não cria Messages nem InvestigationNotes — D-09 é no-op

**O que acontece:** `prisma/seed.ts` cria apenas Reports sem messages ou investigation notes (confirmado por leitura do arquivo). D-09 diz para atualizar o seed, mas não há nada para atualizar.
**Como evitar:** Documentar explicitamente que D-09 foi verificado e é no-op. Não criar Messages/InvestigationNotes de seed — mantém a seed simples e consistente com o estado atual.

### Pitfall 8: `register.action.ts` deve ser desabilitado mesmo com proxy redirect

**O que acontece:** O proxy redirect bloqueia acesso via browser, mas a action ainda pode ser chamada diretamente via POST request (curl, scripts). Defense in depth requer desabilitar a action.
**Como evitar:** Substituir o corpo da action por `throw new ActionError('Registro desabilitado')` ou remover o arquivo e seu import/uso. Dado que não há página de registro após a fase, remover o arquivo é mais limpo.

---

## Code Examples

### SEC-05: Fail-closed Turnstile

```typescript
// src/_actions/public/report.action.ts — linha 14
// ANTES:
if (!process.env.TURNSTILE_SECRET_KEY) return true
// DEPOIS:
if (!process.env.TURNSTILE_SECRET_KEY) return false
```

### SEC-06: Rate limit com primeiro IP

```typescript
// src/_actions/public/report.action.ts — linha 32
// ANTES:
const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
// DEPOIS:
const ip = ((await headers()).get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim()
```

### SEC-03: Encrypt em createMessage (report.data.ts)

```typescript
// encrypt já está importado na linha 5 — nenhum import adicional
export async function createMessage(reportId: string, content: string) {
  return await prisma.message.create({
    data: {
      reportId,
      content: encrypt(content),
      sender: 'USER',
    },
  })
}
```

### SEC-03: Encrypt em createAdminReply (admin.data.ts)

```typescript
import { encrypt } from '@/_shared/lib/crypto' // adicionar import

export async function createAdminReply(reportId: string, authorId: string, content: string) {
  return await prisma.$transaction([
    prisma.message.create({
      data: {
        reportId,
        content: encrypt(content), // adicionar encrypt
        sender: 'ADMIN',
      },
    }),
    // ... activityLog inalterado
  ])
}
```

### SEC-04: Encrypt em createInvestigationNote (admin.data.ts)

```typescript
export async function createInvestigationNote(reportId: string, authorId: string, content: string) {
  return await prisma.$transaction([
    prisma.investigationNote.create({
      data: { reportId, userId: authorId, content: encrypt(content) }, // adicionar encrypt
    }),
    // ... activityLog inalterado
  ])
}
```

### SEC-03/04: Decrypt em getReportByCode (report.query.ts)

```typescript
// Após a lógica de decrypt de report.description existente
const decryptedMessages = report.messages.map((msg) => {
  let content = msg.content
  try {
    content = decrypt(msg.content)
  } catch {
    logger.warn({ messageId: msg.id }, 'Falha ao descriptografar mensagem')
    content = '[DECRYPT_FAILED]'
  }
  return { ...msg, content }
})

return {
  ...report,
  description: decryptedDescription,
  messages: decryptedMessages,
}
```

### SEC-03/04: Decrypt em getReportById (admin.query.ts)

```typescript
// Adicionar após decrypt de description/redactedDescription existentes
const decryptedMessages = report.messages.map((msg) => {
  let content = msg.content
  try {
    content = decrypt(msg.content)
  } catch {
    logger.warn({ messageId: msg.id }, 'Falha ao descriptografar mensagem (admin)')
    content = '[DECRYPT_FAILED]'
  }
  return { ...msg, content }
})

const decryptedNotes = report.investigationNotes.map((note) => {
  let content = note.content
  try {
    content = decrypt(note.content)
  } catch {
    logger.warn({ noteId: note.id }, 'Falha ao descriptografar nota de investigação')
    content = '[DECRYPT_FAILED]'
  }
  return { ...note, content }
})

return {
  ...report,
  description: decryptedDescription,
  redactedDescription: decryptedRedactedDescription,
  attachments: attachmentsWithSignedUrls,
  messages: decryptedMessages,
  investigationNotes: decryptedNotes,
}
```

---

## State of the Art

| Abordagem Antiga                          | Abordagem Atual                           | Impacto                                                 |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `if (!TURNSTILE_SECRET_KEY) return true`  | `return false`                            | Fail-closed: ausência de config = bloqueio, não bypass  |
| IP completo do x-forwarded-for como chave | `.split(',')[0].trim()`                   | Previne bypass de rate limit com IPs concatenados       |
| `Message.content` em plaintext            | `encrypt(content)` AES-256-GCM            | LGPD compliance; PII de whistleblower protegido at-rest |
| Google OAuth cria conta automaticamente   | `signIn` callback bloqueia novos usuários | Plataforma fechada; somente usuários pré-cadastrados    |

---

## Assumptions Log

| #   | Claim                                                                                            | Section                     | Risk if Wrong                                                                                              |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A1  | Acessar `prisma` diretamente em `message.action.ts` para ownership check é aceitável como padrão | Architecture Patterns       | Poderia exigir extrair para `report.query.ts`; baixo risco pois é select simples                           |
| A2  | `seed.ts` não cria Messages nem InvestigationNotes                                               | Common Pitfalls (Pitfall 7) | Se existirem dados de seed não visíveis, precisarão de encrypt; verificado por leitura completa do arquivo |

**A2 foi verificado por leitura direta do arquivo** — `prisma/seed.ts` cria apenas Report (upsert, linha 207), sem `message.create` ou `investigationNote.create`. [VERIFIED: codebase grep]

---

## Open Questions

1. **Deve-se remover `register.action.ts` ou apenas torná-lo um no-op?**
   - O que sabemos: A decisão D-01 diz "desabilitar" mas não especifica remover o arquivo.
   - O que é incerto: Remover o arquivo quebra o import em `register.action.test.ts`.
   - Recomendação: Substituir o corpo por `throw new ActionError('Registro desabilitado')` e atualizar o teste para assert dessa exceção. Manter o arquivo evita mudanças de import cascata.

2. **`getInvestigationNoteById` em `admin.query.ts:156` retorna nota sem decrypt?**
   - O que sabemos: A função retorna o campo `content` diretamente via `prisma.investigationNote.findUnique`.
   - O que é incerto: Quem consome essa função e se espera plaintext.
   - Recomendação: Verificar callers — se retorna para uma action que exibe na UI, adicionar decrypt. Se usado apenas para verificação de existência, pode manter sem decrypt.

---

## Environment Availability

> Fase é puramente code changes — sem novas dependências externas. Step 2.6 SKIPPED (sem novas dependências externas; todos os singletons já existem e estão em uso).

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category         | Applies | Standard Control                                         |
| --------------------- | ------- | -------------------------------------------------------- |
| V2 Authentication     | yes     | NextAuth v5 `signIn` callback — bloquear criação OAuth   |
| V3 Session Management | no      | JWT strategy sem mudanças                                |
| V4 Access Control     | yes     | Middleware redirect + desabilitar register action        |
| V5 Input Validation   | yes     | Ownership check em `sendMessageAction` (reportId + code) |
| V6 Cryptography       | yes     | AES-256-GCM via `crypto.ts` existente — nunca hand-roll  |

### Known Threat Patterns

| Pattern                              | STRIDE                 | Standard Mitigation                                    |
| ------------------------------------ | ---------------------- | ------------------------------------------------------ |
| Auto-registro de SUPERVISOR          | Elevation of Privilege | Proxy redirect + desabilitar action + bloquear OAuth   |
| IDOR em sendMessageAction            | Tampering              | Ownership validation: reportId → trackingCode === code |
| Bypass de captcha por config ausente | Spoofing               | Fail-closed: `return false` quando key ausente         |
| Rate limit bypass via IP spoofing    | Denial of Service      | Usar apenas primeiro IP do x-forwarded-for             |
| PII de whistleblower em plaintext    | Information Disclosure | encrypt() AES-256-GCM em Message e InvestigationNote   |

---

## Sources

### Primary (HIGH confidence)

- Inspeção direta do codebase — todos os arquivos canonicais lidos linha a linha
- `src/_shared/lib/crypto.ts` — funções `encrypt()`/`decrypt()` verificadas (AES-256-GCM, IV 12 bytes, auth tag)
- `src/_modules/report/report.query.ts:31-40` — padrão de decrypt-on-read com try/catch verificado
- `src/proxy.ts` — lógica de redirect e lista `isPublicRoute` verificadas
- `src/_shared/lib/auth.ts` — ausência de callback `signIn` confirmada
- `prisma/seed.ts` — ausência de `message.create` / `investigationNote.create` confirmada

### Secondary (MEDIUM confidence)

- NextAuth v5 `signIn` callback: retornar `false` redireciona para `/auth/error?error=AccessDenied` [CITED: NextAuth v5 docs pattern]

---

## Metadata

**Confidence breakdown:**

- Vulnerabilidades identificadas: HIGH — confirmadas por leitura direta do código
- Padrões de correção: HIGH — baseados no padrão existente `Report.description` no mesmo codebase
- Impacto em testes existentes: HIGH — testes lidos diretamente, asserts identificados
- Comportamento do signIn callback NextAuth: MEDIUM — baseado em documentação citada, não verificado via Context7

**Research date:** 2026-06-30
**Valid until:** 2026-07-30 (stack estável; sem dependências externas novas)
