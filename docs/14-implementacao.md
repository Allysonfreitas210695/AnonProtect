# 14 - Implementação

## 14.1 Organização do Código

O projeto segue a estrutura padrão do Next.js (src folder), mas adota convenções de nomenclatura com prefixo underscore (`_`) para pastas privadas que não representam rotas:

- `src/_actions/`: Server Actions segregadas por domínio (Public/Admin).
- `src/_components/`: Biblioteca de componentes reutilizáveis (UI, Layout, Shared).
- `src/_hooks/`: Lógica de UI extraída em hooks customizados.
- `src/_lib/`: Utilitários globais e instâncias de clientes (Prisma, Auth).
- `src/_schemas/`: Validação de dados centralizada via Zod para garantir integridade.
- `src/app/`: Definição de rotas e layouts utilizando `(admin)` e `(auth)`.
- `messages/`: Dicionários de tradução JSON para suporte multilingue.

## 14.3 Principais Componentes e Tecnologias

- **Inteligência Artificial (Google Gemini)**: Utilizada para triagem automática de denúncias e detecção de PII.
- **Internacionalização (next-intl)**: Arquitetura robusta para suporte a PT-BR, EN e ES com roteamento dinâmico.
- **LGPD Privacy Layer**: Fluxo de anonimização (Art. 18), consentimento granular (Formulários) e monitoramento de retenção (Dashboard).
- **Segurança de Dados**: Implementação de criptografia simétrica (AES-256-GCM) para descrições sensíveis.
- **Robustez e Testes**: Cobertura de testes unitários de 100% nas regras de negócio via Vitest.
- **Framer Motion**: Micro-interações e transições fluidas para percepção de sistema "premium".
