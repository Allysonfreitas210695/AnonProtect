import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { retryAnonymizationAction } from './ai-reanalysis.action'
import * as adminQuery from '@/_modules/admin/admin.query'
import * as reportData from '@/_modules/report/report.data'
import { revalidatePath } from 'next/cache'

const ID = '00000000-0000-4000-8000-000000000000'
const SECRET = 'TEXTO ORIGINAL SECRETO'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/_modules/admin/admin.query', () => ({ getReportForReanalysis: vi.fn() }))
vi.mock('@/_modules/report/report.data', () => ({ processAiAnalysis: vi.fn() }))
vi.mock('@/_shared/lib/crypto', () => ({ decrypt: vi.fn(() => 'TEXTO ORIGINAL SECRETO') }))

let mockUser: { id: string; role: string } | null = null

vi.mock('@/_shared/utils/safe-action', () => ({
  ActionError: class extends Error {},
  supervisorActionClient: {
    schema: () => ({
      action:
        (
          fn: (args: {
            parsedInput: unknown
            ctx: { user: { id: string; role: string } }
          }) => Promise<unknown>
        ) =>
        async (input: unknown) => {
          if (!mockUser) return { serverError: 'Sessão expirada ou usuário não autenticado' }
          if (mockUser.role !== 'SUPERVISOR' && mockUser.role !== 'ADMIN')
            return { serverError: 'Acesso negado' }
          try {
            return { data: await fn({ parsedInput: input, ctx: { user: mockUser } }) }
          } catch (e) {
            return { serverError: e instanceof Error ? e.message : 'Unknown error' }
          }
        },
    }),
  },
}))

type Reanalysis = Awaited<ReturnType<typeof adminQuery.getReportForReanalysis>>
const pendingReport = {
  id: ID,
  description: 'cipher',
  country: 'Brasil',
  redactedDescription: null,
} as Reanalysis

describe('retryAnonymizationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'key')
    mockUser = { id: 'u1', role: 'SUPERVISOR' }
  })
  afterEach(() => vi.unstubAllEnvs())

  it('rejects unauthenticated users', async () => {
    mockUser = null
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.serverError).toBe('Sessão expirada ou usuário não autenticado')
  })

  it('rejects USER role', async () => {
    mockUser = { id: 'u2', role: 'USER' }
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.serverError).toBe('Acesso negado')
    expect(reportData.processAiAnalysis).not.toHaveBeenCalled()
  })

  it('fails in Portuguese without AI key', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '')
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.serverError).toBe(
      'Serviço de IA não configurado: não é possível ocultar os dados da denúncia'
    )
  })

  it('fails when report not found', async () => {
    vi.mocked(adminQuery.getReportForReanalysis).mockResolvedValue(null)
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.serverError).toBe('Denúncia não encontrada')
  })

  it('short-circuits when already anonymized', async () => {
    vi.mocked(adminQuery.getReportForReanalysis).mockResolvedValue({
      ...pendingReport,
      redactedDescription: 'x',
    } as Reanalysis)
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.data?.success).toBe(true)
    expect(reportData.processAiAnalysis).not.toHaveBeenCalled()
  })

  it('runs analysis with decrypted text and never returns it', async () => {
    vi.mocked(adminQuery.getReportForReanalysis).mockResolvedValue(pendingReport)
    vi.mocked(reportData.processAiAnalysis).mockResolvedValue(true)
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(reportData.processAiAnalysis).toHaveBeenCalledWith(ID, SECRET, 'Brasil')
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/report/${ID}`)
    expect(r.data?.success).toBe(true)
    expect(JSON.stringify(r)).not.toContain(SECRET)
  })

  it('fails when analysis fails', async () => {
    vi.mocked(adminQuery.getReportForReanalysis).mockResolvedValue(pendingReport)
    vi.mocked(reportData.processAiAnalysis).mockResolvedValue(false)
    const r = await retryAnonymizationAction({ reportId: ID })
    expect(r.serverError).toBe(
      'Não foi possível ocultar os dados da denúncia. Tente novamente mais tarde.'
    )
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
