import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReportCard } from '../report-card'
import { ReportWithCategory } from '@/_schemas/report'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { code?: string }) =>
    params?.code !== undefined ? `${key}:${params.code}` : key,
}))

const base = {
  id: 'r1',
  caseNumber: 42,
  status: 'PENDING',
  createdAt: new Date('2026-01-01'),
  category: null,
}

const ORIGINAL = 'TEXTO ORIGINAL'
const REDACTED = 'texto [DADO PROTEGIDO]'

const full = (redactedDescription: string | null) =>
  ({ ...base, description: ORIGINAL, redactedDescription }) as unknown as ReportWithCategory

const adminData = (redactedDescription: string | null) =>
  ({ ...base, redactedDescription }) as unknown as Omit<
    ReportWithCategory,
    'description' | 'trackingCodeHash'
  >

const CODE = 'AP-2026-ABCD-EFGH-JKMN-PQRS'

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

  it('admin title shows the case number, never the tracking code', () => {
    render(<ReportCard variant="admin" report={adminData(REDACTED)} />)
    expect(screen.getByText('title:000042')).toBeInTheDocument()
    expect(screen.queryByText(new RegExp(CODE))).toBeNull()
  })

  it('whistleblower title shows the code they typed', () => {
    render(<ReportCard report={full(REDACTED)} trackingCode={CODE} />)
    expect(screen.getByText(`title:${CODE}`)).toBeInTheDocument()
  })

  it('whistleblower keeps toggle between redacted and original', () => {
    render(<ReportCard report={full(REDACTED)} trackingCode={CODE} />)
    expect(screen.getByText(REDACTED)).toBeInTheDocument()
    fireEvent.click(screen.getByText('showOriginal'))
    expect(screen.getByText(ORIGINAL)).toBeInTheDocument()
    expect(screen.getByText('hideOriginal')).toBeInTheDocument()
  })

  it('whistleblower falls back to original when not redacted', () => {
    render(<ReportCard report={full(null)} trackingCode={CODE} />)
    expect(screen.getByText(ORIGINAL)).toBeInTheDocument()
    expect(screen.queryByText('showOriginal')).toBeNull()
  })
})
