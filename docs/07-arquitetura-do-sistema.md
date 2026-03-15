# 07 - Arquitetura do Sistema

## 7.1 Visão Geral da Arquitetura

O **AnonProtect** utiliza uma arquitetura fullstack moderna baseada no framework Next.js. O sistema é dividido em três camadas lógicas principais: Frontend, Backend e Camada de Dados.

### 7.1.1 Frontend (React Server Components)

Responsável pela interface do usuário e renderização otimizada. Utiliza componentes do lado do servidor para reduzir o tempo de carregamento e componentes de cliente para interatividade (como o chat e o dashboard).

### 7.1.2 Backend (Server Actions & API Routes)

Processa a lógica de negócio, autenticação e validação de dados. As **Server Actions** atuam como ponte segura entre o formulário do usuário e o banco de dados, enquanto as API Routes lidam com integrações externas como o callback do Google OAuth.

### 7.1.3 Camada de Dados (Prisma & PostgreSQL)

Gerencia a persistência das informações. O Prisma atua como a interface de consulta, garantindo integridade referencial e tipagem forte em todas as operações.

## 7.2 Diagrama de Arquitetura (PlantUML)

```plantuml
@startuml
package "Client Side (Browser)" {
  [React Components]
  [Tailwind CSS UI]
}

package "Next.js Server" {
  [App Router (Server Components)]
  [Server Actions]
  [Auth.js Middleware]
}

database "PostgreSQL" {
  [Prisma ORM]
  [Database Tables]
}

cloud "External Services" {
  [Google OAuth]
}

[React Components] --> [App Router]
[App Router] --> [Server Actions]
[Server Actions] --> [Prisma ORM]
[Prisma ORM] --> [Database Tables]
[Auth.js Middleware] <--> [Google OAuth]
@enduml
```

## 7.3 Infraestrutura e Fluxo de Dados

O fluxo de uma denúncia inicia-se na camada de cliente, é validado por um schema **Zod** no servidor, processado pela Server Action correspondente e persistido via Prisma. A resposta retorna apenas o código de rastreio, mantendo o estado da aplicação limpo e seguro.
