# 14 - Implementação

## 14.1 Organização do Código

O projeto segue a estrutura padrão do Next.js (src folder), mas adota convenções de nomenclatura com prefixo underscore (`_`) para pastas privadas que não representam rotas:

- `src/_actions/`: Server Actions segregadas por domínio (Public/Admin).
- `src/_components/`: Biblioteca de componentes reutilizáveis (UI, Layout, Shared).
- `src/_hooks/`: Lógica de UI extraída em hooks customizados para melhor legibilidade.
- `src/_lib/`: Utilitários globais e instâncias de clientes (Prisma, Auth).
- `src/app/`: Definição de rotas e layouts utilizando o sistema de grupos `(admin)` e `(auth)`.

## 14.3 Principais Componentes e Tecnologias

- **LGPD Privacy Layer**: Fluxo de anonimização de PII via IA e auditoria de visualização.
- **Data Security**: Implementação de criptografia simétrica (AES-256-GCM) para dados em repouso.
- **Robustness**: Cobertura de testes unitários de 100% nas regras de negócio críticas via Vitest.
- **Framer Motion**: Micro-interações e transições fluidas para percepção de sistema "premium".
