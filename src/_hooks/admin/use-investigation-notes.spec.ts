import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInvestigationNotes } from './use-investigation-notes'

vi.mock('@/_actions/admin/report.action', () => ({
  createInvestigationNoteAction: vi.fn(),
  deleteInvestigationNoteAction: vi.fn(),
}))
vi.mock('next-safe-action/hooks', () => ({
  useAction: vi.fn(() => ({
    execute: vi.fn(),
    isExecuting: false,
  })),
}))

vi.mock('react-hook-form', async () => {
  const actual = (await vi.importActual('react-hook-form')) as Record<string, unknown>
  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => void) => fn,
      reset: vi.fn(),
      control: {},
    }),
  }
})

describe('useInvestigationNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInvestigationNotes('report-123'))

    expect(result.current.isCreating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.isDeleteDialogOpen).toBe(false)
  })

  it('should handle submit', async () => {
    const { result } = renderHook(() => useInvestigationNotes('report-123'))

    await act(async () => {
      const onSubmit = result.current.onSubmitCreate as unknown as (values: {
        content: string
      }) => Promise<void>
      await onSubmit({ content: 'Test note' })
    })
  })
})
