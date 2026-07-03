---
phase: quick-260703-hba
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - prisma/seed.ts
autonomous: true
requirements: [BUG-SEED-INVALID-PASSWORD-HASH]

must_haves:
  truths:
    - 'Após rodar `npx prisma db seed`, é possível logar em /login com admin@sistema.com / admin123 e obter uma sessão ADMIN'
    - 'Após rodar `npx prisma db seed`, é possível logar em /login com supervisor@sistema.com / super123 e obter uma sessão SUPERVISOR'
    - 'Os e-mails/senhas do seed batem exatamente com os documentados em CLAUDE.md (seção Commands): admin@sistema.com/admin123, supervisor@sistema.com/super123'
  artifacts:
    - path: 'prisma/seed.ts'
      provides: 'Hashes bcrypt reais (60 caracteres, gerados com bcryptjs cost 12) e e-mails corretos'
      contains: 'admin@sistema.com'
  key_links:
    - from: 'prisma/seed.ts'
      to: 'src/_shared/lib/auth.ts'
      via: 'compare(password, user.password) do bcryptjs'
      pattern: 'bcrypt'
---

<objective>
Corrigir bug crítico descoberto durante validação manual: o script `prisma/seed.ts` usa um hash bcrypt **inválido/fake** (`'$2a$10$wR.pD1Mv.W3m.L8M.u.e.eXF.mE.xU.jD.qW.zD.vS.yG'`, 52 caracteres — um hash bcrypt real tem 60) para os usuários ADMIN e SUPERVISOR seed. Isso significa que NENHUMA senha jamais bate com esse hash — é literalmente impossível logar no painel administrativo com as credenciais seedadas, bloqueando totalmente o teste/uso do dashboard.

Além disso, os e-mails no seed (`admin@admin.com`, `supervisor@supervisor.com`) não batem com os documentados em `CLAUDE.md` na seção Commands (`admin@sistema.com` / `admin123`, `supervisor@sistema.com` / `super123`). Decisão já tomada pelo usuário: alinhar o seed com o que está documentado no CLAUDE.md, já que é o contrato que outros desenvolvedores/avaliadores do TCC vão seguir.

Purpose: Garantir que qualquer pessoa que rode `npx prisma db seed` consiga logar no painel admin com as credenciais exatamente como documentadas no CLAUDE.md.
Output: `prisma/seed.ts` atualizado com e-mails `admin@sistema.com`/`supervisor@sistema.com` e hashes bcrypt REAIS e válidos para `admin123`/`super123` (cost factor 12, consistente com o restante do app em `src/_actions/public/reset-password.action.ts:92`).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@prisma/seed.ts
@src/_shared/lib/auth.ts
@src/_actions/public/reset-password.action.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Corrigir e-mails e hash de senha inválido no seed</name>
  <files>prisma/seed.ts</files>
  <action>
Em `prisma/seed.ts`:

1. Troque `const adminEmail = 'admin@admin.com'` por `const adminEmail = 'admin@sistema.com'`.
2. Troque `const superEmail = 'supervisor@supervisor.com'` por `const superEmail = 'supervisor@sistema.com'`.
3. Remova a constante `HASHED_PASSWORD` única e substitua por dois hashes bcrypt REAIS e distintos, um para cada usuário, gerados com `bcryptjs` cost factor 12 (mesmo padrão usado em `src/_actions/public/reset-password.action.ts:92`, `bcrypt.hash(password, 12)`):
   - Hash de `admin123` (use exatamente este hash, já gerado e verificado: `$2b$12$q5HZqxwRHsXiSW2WKU2iYOucgeq45Vp5XmZRD1oAYn4mlCLQg9Tta`)
   - Hash de `super123` (use exatamente este hash, já gerado e verificado: `$2b$12$A1xel4LQT6jqV14Qm1pSk.xY4NQeGs2TUj0TZCePFSQg/t8ovX6Di`)
   - Use o hash de `admin123` no upsert do usuário ADMIN e o de `super123` no upsert do usuário SUPERVISOR (hoje ambos usam a mesma constante `HASHED_PASSWORD` — separe em duas constantes, ex. `ADMIN_PASSWORD_HASH` e `SUPERVISOR_PASSWORD_HASH`).
4. Não altere nenhuma outra lógica do seed (departamentos, categorias, relatos de exemplo).
5. Adicione um comentário curto acima das constantes de hash explicando que são hashes pré-gerados de `admin123`/`super123` (bcryptjs, cost 12) — evite recalcular hash em runtime no seed para manter determinismo, mas deixe claro qual senha cada hash representa.

Depois de editar, rode `npx prisma db seed` e confirme no output que o seed conclui sem erros. NÃO tente testar login no navegador — isso será feito depois pelo orquestrador com Playwright.

Siga o estilo do projeto: sem ponto-e-vírgula, aspas simples, 2 espaços.
</action>
<verify>
<automated>node -e "const bcrypt=require('bcryptjs'); const fs=require('fs'); const src=fs.readFileSync('prisma/seed.ts','utf8'); const m=[...src.matchAll(/\$2[aby]\$\d+\$[./A-Za-z0-9]{53}/g)].map(x=>x[0]); if(m.length<2){console.error('menos de 2 hashes encontrados');process.exit(1)}; const okAdmin=m.some(h=>bcrypt.compareSync('admin123',h)); const okSuper=m.some(h=>bcrypt.compareSync('super123',h)); if(!okAdmin||!okSuper){console.error('hash nao bate com admin123/super123');process.exit(1)}; console.log('OK: hashes validos para admin123 e super123 encontrados em seed.ts')"</automated>
<automated>npx prisma db seed</automated>
</verify>
<done>seed.ts usa admin@sistema.com/admin123 e supervisor@sistema.com/super123 com hashes bcrypt reais e válidos (60 caracteres); `npx prisma db seed` roda sem erros; script de verificação confirma que os hashes batem com as senhas documentadas.</done>
</task>

</tasks>

<verification>
- Script node de verificação confirma hashes válidos para admin123/super123 em seed.ts.
- `npx prisma db seed` executa sem erros.
- (Fora do escopo do executor) o orquestrador vai testar login manualmente no navegador via Playwright depois.
</verification>

<success_criteria>

- `npx prisma db seed` popula admin@sistema.com/admin123 (ADMIN) e supervisor@sistema.com/super123 (SUPERVISOR) com hashes bcrypt válidos.
- Credenciais batem exatamente com o documentado em CLAUDE.md.
  </success_criteria>

<output>
Create `.planning/quick/260703-hba-corrigir-hash-de-senha-invalido-e-emails/260703-hba-SUMMARY.md` when done
</output>
