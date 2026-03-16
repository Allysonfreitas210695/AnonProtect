import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInvestigationNotes } from '../use-investigation-notes'

// Mock actions
vi.mock('@/_actions/admin/report.action', () => ({
  createInvestigationNoteAction: vi.fn(),
  deleteInvestigationNoteAction: vi.fn(),
}))

// Mock hooks
vi.mock('next-safe-action/hooks', () => ({
  useAction: vi.fn(() => ({
    execute: vi.fn(),
    isExecuting: false,
  })),
}))

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(actual as any),
    useForm: () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSubmit: (fn: any) => fn,
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
      // With our mock, onSubmitCreate is the raw function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result.current.onSubmitCreate as any)({ content: 'Test note' })
    })
  })
})
