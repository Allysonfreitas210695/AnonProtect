import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as aiReanalysis from '@/_actions/admin/ai-reanalysis.action'
import * as categoryActions from '@/_actions/admin/category.action'
import * as departmentActions from '@/_actions/admin/department.action'
import * as profileActions from '@/_actions/admin/profile.action'
import * as reportActions from '@/_actions/admin/report.action'
import { anonymizeUser } from '@/_actions/admin/anonymize-user'
import { exportUserData } from '@/_actions/admin/export-data'

// Registra qualquer acesso ao Prisma (prisma.report.update, prisma.$transaction, ...)
const dbAccess = vi.hoisted(() => [] as string[])

vi.mock('@/_shared/lib/prisma', () => {
  const delegate = (model: string) =>
    new Proxy(
      {},
      {
        get: (_target, method) => {
          dbAccess.push(`${model}.${String(method)}`)
          return () => Promise.resolve(null)
        },
      }
    )
  return {
    prisma: new Proxy({}, { get: (_target, model) => delegate(String(model)) }),
  }
})

/**
 * Server Actions são endpoints HTTP públicos: o middleware (proxy.ts) não é
 * fronteira de segurança. Este teste garante que TODA action administrativa
 * verifica sessão e papel por conta própria, sem tocar no banco antes disso.
 */

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let mockUser: { id: string; role: string; name: string } | null = null

vi.mock('@/_shared/lib/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
  signOut: vi.fn(),
}))

type SafeAction = (input: unknown) => Promise<{ serverError?: string } | undefined>

const UNAUTHENTICATED = 'Sessão expirada ou usuário não autenticado'
const ADMIN_ONLY = 'Acesso negado: Requer privilégios de Administrador'
const SUPERVISOR_ONLY = 'Acesso negado: Requer privilégios de Supervisor ou superior'

// Todas as actions exportadas pelos arquivos admin que usam next-safe-action
const safeActions: Array<[string, SafeAction]> = Object.entries({
  ...aiReanalysis,
  ...categoryActions,
  ...departmentActions,
  ...profileActions,
  ...reportActions,
})
  .filter(([name]) => name.endsWith('Action'))
  .map(([name, fn]) => [name, fn as unknown as SafeAction])

const adminOnly = [
  'createCategoryAction',
  'toggleCategoryAction',
  'deleteCategoryAction',
  'createDepartmentAction',
  'deleteDepartmentAction',
  'deleteReportAction',
]

const supervisorOrAbove = [
  'retryAnonymizationAction',
  'updateReportStatusAction',
  'sendAdminReplyAction',
  'createInvestigationNoteAction',
  'deleteInvestigationNoteAction',
  'forwardReportAction',
  'batchUpdateReportStatusAction',
]

function expectNoDatabaseAccess() {
  expect(dbAccess).toEqual([])
}

describe('Server Actions administrativas: autenticação e papel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    dbAccess.length = 0
  })

  it('cobre todas as actions exportadas (lista não ficou desatualizada)', () => {
    const names = safeActions.map(([name]) => name).sort()
    expect(names).toEqual(
      [...adminOnly, ...supervisorOrAbove, 'updateProfileAction', 'updatePasswordAction'].sort()
    )
  })

  it.each(safeActions)('%s bloqueia usuário não autenticado', async (_name, action) => {
    const result = await action({})
    expect(result?.serverError).toBe(UNAUTHENTICATED)
    expectNoDatabaseAccess()
  })

  it.each(adminOnly)('%s bloqueia SUPERVISOR', async (name) => {
    mockUser = { id: 's-1', role: 'SUPERVISOR', name: 'Sup' }
    const action = safeActions.find(([n]) => n === name)![1]
    const result = await action({})
    expect(result?.serverError).toBe(ADMIN_ONLY)
    expectNoDatabaseAccess()
  })

  it.each(supervisorOrAbove)('%s bloqueia papel sem privilégio', async (name) => {
    mockUser = { id: 'u-1', role: 'USER', name: 'User' }
    const action = safeActions.find(([n]) => n === name)![1]
    const result = await action({})
    expect(result?.serverError).toBe(SUPERVISOR_ONLY)
    expectNoDatabaseAccess()
  })

  it('anonymizeUser e exportUserData exigem sessão', async () => {
    await expect(anonymizeUser()).rejects.toThrow()
    await expect(exportUserData()).rejects.toThrow()
    expectNoDatabaseAccess()
  })
})
