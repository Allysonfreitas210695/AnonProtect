# Arquitetura do Projeto

Este projeto utiliza uma versão moderna do **Next.js 16** com **App Router**, seguindo princípios de **Clean Architecture** para garantir manutenibilidade e escalabilidade.

## Estrutura de Pastas (`src/`)

### 📂 `_actions/`

Contém as **Server Actions**, que são o ponto de entrada para mutações de dados no servidor.

- Protegidas por middleware de autenticação via `next-safe-action`.
- Divididas em `admin/` (ações restritas) e `public/` (ações acessíveis por denunciantes).

### 📂 `_data-access/`

Camada de persistência (Repository Pattern). Separa a lógica de consulta ao banco de dados da lógica de negócio.

- `*.query.ts`: Somente leitura (Selects).
- `*.repository.ts`: Mutações (Create, Update, Delete).

### 📂 `_hooks/`

Abstrai a lógica de estado da UI e integração com Server Actions.

- Utiliza `next-safe-action/hooks` para gerenciar estados de execução e erros.

### 📂 `_schemas/`

Schemas de validação **Zod** centralizados e compartilhados entre formulários (cliente) e actions (servidor).

### 📂 `_components/`

- `ui/`: Componentes base (Shadcn/UI).
- `shared/`: Componentes de negócio reutilizáveis (ex: `StatusBadge`).

### 📂 `_lib/`

Configurações de infraestrutura (Prisma Client, constantes, utilitários globais).

---

## Fluxo de Dados

1. **Página/Formulário**: Captura entrada do usuário.
2. **Hook**: Valida localmente via Zod e chama a Server Action.
3. **Server Action**: Valida permissões e schema, então chama o Repository.
4. **Repository**: Interage com o **Prisma** para persistir os dados.
5. **Revalidação**: A Action usa `revalidatePath` para atualizar o cache do Next.js.
