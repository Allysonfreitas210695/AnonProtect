# Banco de Dados (Prisma 7)

O projeto utiliza **PostgreSQL** com o **Prisma ORM (v7)**. O schema está desenhado para suportar denúncias anônimas, acompanhamento via código de rastreio e auditoria de ações administrativas.

## Modelos Principais

### `User`

Usuários do sistema administrativo (ADMIN, SUPERVISOR).

- Suporta autenticação via credenciais (NextAuth v5).
- Relacionado a denúncias atribuídas e notas de investigação.

### `Report` (Denúncia)

Entidade central do sistema.

- `trackingCode`: Código único (ex: RPT-XXXX) para consulta pública.
- `status`: PENDING, IN_PROGRESS, RESOLVED, REJECTED.

### `Message`

Comunicação entre o denunciante (via código de rastreio) e o administrador.

### `InvestigationNote`

Notas internas visíveis apenas para administradores sobre o progresso de uma denúncia.

### `ActivityLog`

Trilha de auditoria que registra todas as mudanças de status e atribuições, garantindo transparência no processo.

## Padrão de Acesso (`_data-access`)

As consultas são centralizadas para evitar a dispersão do `prisma.model.find...` pela aplicação:

- **Queries**: Localizadas em `src/_data-access/[dominio]/[entidade].query.ts`.
- **Repositories**: Localizados em `src/_data-access/[dominio]/[entidade].repository.ts`.
