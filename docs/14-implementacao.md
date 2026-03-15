# 14 - Implementação

## 14.1 Organização do Código

O projeto segue a estrutura padrão do Next.js (src folder), mas adota convenções de nomenclatura com prefixo underscore (`_`) para pastas privadas que não representam rotas:

- `src/_actions/`: Server Actions segregadas por domínio (Public/Admin).
- `src/_components/`: Biblioteca de componentes reutilizáveis (UI, Layout, Shared).
- `src/_hooks/`: Lógica de UI extraída em hooks customizados para melhor legibilidade.
- `src/_lib/`: Utilitários globais e instâncias de clientes (Prisma, Auth).
- `src/app/`: Definição de rotas e layouts utilizando o sistema de grupos `(admin)` e `(auth)`.

## 14.2 Padrões de Implementação

### 14.2.1 Validação com Zod

Todos os inputs do usuário são validados no servidor utilizando schemas do **Zod**. Isso garante que dados malformados não cheguem à camada de persistência.

### 14.2.2 Internacionalização (next-intl)

O sistema foi construído desde o dia zero para suportar múltiplos idiomas. As mensagens estão centralizadas em arquivos JSON (`messages/pt-BR.json` e `messages/en.json`), facilitando a manutenção e tradução.

### 14.2.3 Gerenciamento de Tema

Utiliza `next-themes` para oferecer suporte nativo a temas escuros e claros. A escolha do tema é persistida localmente e respeita a preferência do sistema operacional do usuário.

## 14.3 Principais Componentes

- **PasswordInput**: Componente customizado com toggle de visibilidade.
- **ReportDetails**: Componente complexo que orquestra a visualização do dossiê.
- **ThemeToggle**: Controle dinâmico da estética da aplicação.
