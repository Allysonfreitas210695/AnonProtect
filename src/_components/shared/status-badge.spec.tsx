import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatusBadge } from './status-badge'
import { ReportStatus } from '@/_generated/prisma'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Análise',
      RESOLVED: 'Resolvido',
      REJECTED: 'Rejeitado',
      ARCHIVED: 'Arquivado',
    }
    return messages[key] || key
  },
}))

describe('StatusBadge Component', () => {
  it('should render the correct label for PENDING status', () => {
    render(<StatusBadge status={ReportStatus.PENDING} />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('should render the correct label for IN_PROGRESS status', () => {
    render(<StatusBadge status={ReportStatus.IN_PROGRESS} />)
    expect(screen.getByText('Em Análise')).toBeInTheDocument()
  })

  it('should render the correct label for RESOLVED status', () => {
    render(<StatusBadge status={ReportStatus.RESOLVED} />)
    expect(screen.getByText('Resolvido')).toBeInTheDocument()
  })

  it('should render the correct label for REJECTED status', () => {
    render(<StatusBadge status={ReportStatus.REJECTED} />)
    expect(screen.getByText('Rejeitado')).toBeInTheDocument()
  })

  it('should render the correct label for ARCHIVED status', () => {
    render(<StatusBadge status={ReportStatus.ARCHIVED} />)
    expect(screen.getByText('Arquivado')).toBeInTheDocument()
  })

  it('should apply custom className when provided', () => {
    render(<StatusBadge status={ReportStatus.PENDING} className="custom-test-class" />)
    const badge = screen.getByText('Pendente').closest('div')
    expect(badge).toHaveClass('custom-test-class')
  })
})
