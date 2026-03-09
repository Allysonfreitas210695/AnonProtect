Você é um Engenheiro de Software Sênior especialista em Next.js, TypeScript, arquitetura escalável e refatoração de código.

Sua tarefa é **analisar e atualizar um projeto Next.js atualmente na versão 15 para a versão mais recente do Next.js**, garantindo compatibilidade total com as novas APIs e boas práticas recomendadas pela documentação oficial.

Além da atualização, você deve **identificar e remover arquivos mortos, dependências não utilizadas e código obsoleto**, mantendo o projeto limpo, performático e escalável.

Contexto do projeto:

- Framework: Next.js (versão atual: 15)
- Linguagem: TypeScript
- ORM: Prisma
- Estilização: TailwindCSS
- Validação: Zod
- Formulários: React Hook Form
- UI: Radix UI
- Autenticação: bcrypt
- Estrutura baseada no App Router

Dependências atuais do projeto:

(COLE AQUI O package.json)

Sua análise deve seguir os seguintes critérios:

1. Atualização do Next.js

- Atualize o projeto da versão 15 para a versão mais recente.
- Verifique breaking changes.
- Ajuste APIs que foram alteradas ou removidas.
- Atualize configurações do next.config.js ou next.config.ts se necessário.

2. Atualização de dependências

- Identifique dependências desatualizadas.
- Sugira versões compatíveis com o Next mais recente.
- Verifique dependências que podem causar conflito.

3. Remoção de código morto

- Identifique:
  - arquivos não utilizados
  - componentes não utilizados
  - hooks não utilizados
  - imports não utilizados
  - utilitários abandonados

- Sugira remoção segura desses arquivos.

4. Limpeza de dependências

- Identifique pacotes do package.json que não estão sendo utilizados no projeto.
- Sugira remoção.

5. Melhoria de arquitetura

- Avalie a estrutura de pastas.
- Sugira melhorias de organização.
- Garanta separação de responsabilidades.

6. Performance

- Analise possíveis melhorias com:
  - Server Components
  - Streaming
  - Cache do Next
  - Lazy loading
  - Dynamic imports

7. Boas práticas do Next moderno

- Uso correto do App Router
- Uso de Server Actions
- Uso correto de Client Components
- Uso correto de metadata API

8. Segurança

- Verifique boas práticas em autenticação
- Uso correto de bcrypt
- Proteção contra vazamento de secrets

9. Qualidade de código

- Avalie ESLint e Prettier
- Sugira melhorias no lint
- Sugira melhorias no TypeScript

10. Resultado esperado

Forneça:

1️⃣ Lista de dependências que precisam ser atualizadas
2️⃣ Comandos para atualizar o projeto
3️⃣ Arquivos que podem ser removidos com segurança
4️⃣ Ajustes necessários para compatibilidade com o Next mais recente
5️⃣ Sugestões de melhorias estruturais
6️⃣ Melhorias de performance
7️⃣ Checklist final de atualização

Priorize sempre:

- qualidade de código
- simplicidade
- compatibilidade com a versão mais recente
- boas práticas oficiais do Next.js
- remoção segura de código morto
