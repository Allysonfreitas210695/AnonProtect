import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInvestigationNotes } from '../use-investigation-notes'
import { toast } from 'sonner'

// Mock actions
vi.mock('@/_actions/admin/report.action', () => ({
  createInvestigationNoteAction: vi.fn(),
  deleteInvestigationNoteAction: vi.fn(),
}))

// Mock hooks
vi.mock('next-safe-action/hooks', () => ({
  useAction: vi.fn((action, options) => {
    return {
      execute: vi.fn((args) => {
        // Trigger onSuccess/onError if needed for testing specific branches
      }),
      isExecuting: false,
    }
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useInvestigationNotes Hook', () => {
  const reportId = 'report-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInvestigationNotes(reportId))

    expect(result.current.isDeleteDialogOpen).toBe(false)
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
  })

  it('should open delete dialog when onClickDelete is called', () => {
    const { result } = renderHook(() => useInvestigationNotes(reportId))

    act(() => {
      result.current.onClickDelete('note-1')
    })

    expect(result.current.isDeleteDialogOpen).toBe(true)
  })

  it('should close delete dialog when setIsDeleteDialogOpen(false) is called', () => {
    const { result } = renderHook(() => useInvestigationNotes(reportId))

    act(() => {
      result.current.onClickDelete('note-1')
    })
    expect(result.current.isDeleteDialogOpen).toBe(true)

    act(() => {
      result.current.setIsDeleteDialogOpen(false)
    })
    expect(result.current.isDeleteDialogOpen).toBe(false)
  })
})
