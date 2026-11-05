import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReportCard } from '../report-card'
import { ReportWithCategory } from '@/_schemas/report'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const base = {
  id: 'r1',
  trackingCode: 'ABC',
  status: 'PENDING',
  createdAt: new Date('2026-01-01'),
  category: null,
}

const ORIGINAL = 'TEXTO ORIGINAL'
const REDACTED = 'texto [DADO PROTEGIDO]'

const full = (redactedDescription: string | null) =>
  ({ ...base, description: ORIGINAL, redactedDescription }) as unknown as ReportWithCategory

const adminData = (redactedDescription: string | null) =>
  ({ ...base, redactedDescription }) as unknown as Omit<ReportWithCategory, 'description'>

describe('ReportCard', () => {
  it('admin with redaction shows only redacted text and no toggle', () => {
    render(<ReportCard variant="admin" report={adminData(REDACTED)} />)
    expect(screen.getByText(REDACTED)).toBeInTheDocument()
    expect(screen.getByText('protectedByLgpd')).toBeInTheDocument()
    expect(screen.queryByText('showOriginal')).toBeNull()
    expect(screen.queryByText(ORIGINAL)).toBeNull()
  })

  it('admin without redaction shows pending state and action slot', () => {
    render(
      <ReportCard
        variant="admin"
        report={adminData(null)}
        pendingAction={<button>retry-slot</button>}
      />
    )
    expect(screen.getByText('pendingAnonymization')).toBeInTheDocument()
    expect(screen.getByText('retry-slot')).toBeInTheDocument()
    expect(screen.queryByText(ORIGINAL)).toBeNull()
  })

  it('whistleblower keeps toggle between redacted and original', () => {
    render(<ReportCard report={full(REDACTED)} />)
    expect(screen.getByText(REDACTED)).toBeInTheDocument()
    fireEvent.click(screen.getByText('showOriginal'))
    expect(screen.getByText(ORIGINAL)).toBeInTheDocument()
    expect(screen.getByText('hideOriginal')).toBeInTheDocument()
  })

  it('whistleblower falls back to original when not redacted', () => {
    render(<ReportCard report={full(null)} />)
    expect(screen.getByText(ORIGINAL)).toBeInTheDocument()
    expect(screen.queryByText('showOriginal')).toBeNull()
  })
})
