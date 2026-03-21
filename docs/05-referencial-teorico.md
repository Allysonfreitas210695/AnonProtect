# 05 - Referencial Teórico

## 5.1 Desenvolvimento Web Moderno

O desenvolvimento de aplicações web evoluiu de páginas estáticas para ecossistemas dinâmicos e altamente integrados. O paradigma atual foca em **User Experience (UX)**, performance e segurança. No centro desta evolução está o JavaScript (e seu superconjunto TypeScript), que permite o desenvolvimento fullstack, unificando a linguagem do frontend e backend.

## 5.2 Framework Next.js 16

O **Next.js** é um framework React que possibilita funcionalidades como renderização no lado do servidor (SSR) e geração de sites estáticos (SSG). A utilização da versão 16 traz o **App Router**, uma arquitetura baseada em _React Server Components_ que otimiza o carregamento de dados e reduz o bundle enviado ao cliente.

## 5.3 Arquitetura de Software e Server Actions

A arquitetura do sistema utiliza o conceito de **Server Actions**, que permite definir funções assíncronas executadas diretamente no servidor, eliminando a necessidade de criar endpoints de API REST tradicionais para cada operação de formulário. Isso simplifica o fluxo de dados e aumenta a segurança ao manter a lógica de negócio protegida no servidor.

## 5.4 Persistência com Prisma ORM e PostgreSQL

O **Prisma** é um ORM (Object-Relational Mapping) de próxima geração que permite a manipulação do banco de dados de forma tipada e segura. A utilização do **PostgreSQL** como banco de dados relacional garante a robustez necessária para lidar com relacionamentos complexos entre usuários, denúncias e categorias.

## 5.5 Autenticação com Auth.js (NextAuth.js v5)

A segurança do acesso administrativo é garantida pelo **Auth.js**, uma solução completa de autenticação para Next.js. O sistema suporta múltiplos provedores, incluindo credenciais tradicionais (e-mail/senha) hasheadas com **bcryptjs** e integração OAuth 2.0 com o **Google**, permitindo um acesso ágil e seguro para os supervisores.

## 5.6 Design System e Tailwind CSS 4

Para a interface, foi selecionado o **Tailwind CSS 4**, um framework utilitário que permite a criação de designs customizados e responsivos diretamente no HTML/JSX. Complementarmente, o uso de componentes do **Shadcn UI** garante acessibilidade e consistência visual premium em todo o dashboard.

## 5.7 Inteligência Artificial e Processamento de Linguagem Natural (NLP)

O sistema integra modelos de linguagem de grande escala (LLMs) através do **Google Gemini**. A utilização de NLP permite a triagem automatizada, classificação de categorias, determinação de prioridade e a técnica de **Redação de PII (Personally Identifiable Information)**, garantindo que dados sensíveis sejam protegidos de forma proativa antes da visualização humana.

## 5.8 Legislação de Proteção de Dados (LGPD e GDPR)

O AnonProtect é fundamentado nos princípios da **Lei Geral de Proteção de Dados (Lei 13.709/2018)**. A arquitetura contempla os direitos do titular (Art. 18), incluindo o Direito ao Esquecimento e Portabilidade, além de implementar o **Privacy by Design**, onde a privacidade é uma característica intrínseca do desenvolvimento do software, e não um complemento posterior.
