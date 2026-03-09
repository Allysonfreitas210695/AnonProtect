import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '../status-badge'
import { ReportStatus } from '@/_generated/prisma'

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
    expect(screen.getByText('Arquivado')).toBeInTheDocument()
  })

  it('should apply custom className when provided', () => {
    render(<StatusBadge status={ReportStatus.PENDING} className="custom-test-class" />)
    const badge = screen.getByText('Pendente')
    expect(badge).toHaveClass('custom-test-class')
  })
})
