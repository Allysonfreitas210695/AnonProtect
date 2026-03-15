# 06 - Metodologia

## 6.1 Metodologia de Desenvolvimento

Para o desenvolvimento do **AnonProtect**, foi adotada uma abordagem ágil inspirada no framework **Scrum**. O processo foi dividido em ciclos incrementais de desenvolvimento, permitindo a entrega contínua de funcionalidades e a adaptação rápida a novos requisitos.

## 6.2 Abordagem de Implementação

A implementação seguiu os seguintes passos metodológicos:

1.  **Levantamento de Requisitos**: Identificação das necessidades de anonimato e gestão de denúncias.
2.  **Modelagem de Dados**: Definição do esquema do banco de dados utilizando Prisma para refletir as necessidades de escalabilidade.
3.  **Desenvolvimento do Core**: Implementação do motor de submissão de denúncias e geração de códigos de rastreio.
4.  **Interface e Experiência do Usuário (UI/UX)**: Criação de telas responsivas com suporte a temas dinâmicos (Light/Dark Mode).
5.  **Segurança e Autenticação**: Integração do sistema de login administrativo e proteção de rotas sensíveis.
6.  **Refinamento e Testes**: Ciclos de correção de bugs e melhoria da performance visual.

## 6.3 Tecnologias Utilizadas na Construção

- **Linguagem**: TypeScript (Strict Mode).
- **Frontend/Backend**: Next.js 16 (Fullstack framework).
- **Banco de Dados**: PostgreSQL.
- **ORM**: Prisma v7.
- **Gestão de Estado/Formulários**: React Hook Form e Zod.
- **Internacionalização**: next-intl para suporte a múltiplos idiomas.
- **Estilização**: Tailwind CSS 4.x.
