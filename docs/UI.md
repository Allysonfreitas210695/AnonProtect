# Interface e Design System

O projeto utiliza um design moderno, responsivo e com suporte a Dark Mode.

## Tecnologias Core

- **React 19**: Aproveitando melhorias em hooks e concorrência.
- **Tailwind CSS v4**: Utilizando as novas APIs de configuração baseadas em CSS (CSS-first configuration).
- **Shadcn/UI**: Biblioteca de componentes pré-estilizados mas totalmente customizáveis via `_components/ui/`.

## Componentes Compartilhados (`_components/shared/`)

Para manter a consistência visual, extraímos componentes lógicos:

- **`StatusBadge`**: Centraliza as cores e labels de todos os estados de uma denúncia (Pendente, Em Andamento, etc).
- **`ReportCard`**: Visualização resumida e padronizada de denúncias.

## Experiência do Usuário (UX)

- **Feedback Visual**: Uso de `sonner` para notificações toast.
- **States**: Estados de carregamento (`Loader2`) integrados em todos os botões de ação via hooks.
- **Tratamento de Erros**: Validação de formulários no cliente e no servidor via Zod.
