import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessageAction } from './message.action'
import * as reportRepository from '@/_modules/report/report.data'
import { prisma } from '@/_shared/lib/prisma'
import { sendEmail } from '@/_shared/lib/aws'
import { checkMessageRateLimit } from '@/_shared/lib/ratelimit'
import { hashTrackingCode } from '@/_shared/utils/tracking'

const HASH = hashTrackingCode('AP-2026-TEST')

vi.mock('@/_modules/report/report.data', () => ({
  createMessage: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({ get: vi.fn(() => '203.0.113.7') })),
}))

vi.mock('@/_shared/lib/ratelimit', () => ({
  checkMessageRateLimit: vi.fn(),
}))

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      findUnique: vi.fn(),
    },
    message: {
      count: vi.fn(),
    },
  },
}))

vi.mock('@/_shared/lib/aws', () => ({
  sendEmail: vi.fn(),
}))

describe('Message Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(checkMessageRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })
    ;(prisma.message.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)
  })

  it('should send a message successfully', async () => {
    const mockInput = {
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'Hello, this is a test message.',
    }

    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: { email: 'admin@sistema.com' },
    })

    const result = await sendMessageAction(mockInput)

    expect(result?.data).toEqual({ success: true, message: 'Mensagem enviada com sucesso!' })
    expect(reportRepository.createMessage).toHaveBeenCalledWith(
      mockInput.reportId,
      mockInput.content
    )
  })

  it('sends email when report has an assigned admin', async () => {
    const mockInput = {
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'Hello, this is a test message.',
    }

    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: { email: 'admin@sistema.com' },
    })

    const result = await sendMessageAction(mockInput)

    expect(result?.data).toEqual({ success: true, message: 'Mensagem enviada com sucesso!' })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(
      'admin@sistema.com',
      expect.any(String),
      expect.stringContaining('#000007')
    )
    // O código de protocolo é a credencial do denunciante e não pode ir no e-mail
    expect(JSON.stringify(vi.mocked(sendEmail).mock.calls)).not.toContain('AP-2026-TEST')
  })

  it('does not send email when assignedTo is null', async () => {
    const mockInput = {
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'Hello, this is a test message.',
    }

    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: null,
    })

    const result = await sendMessageAction(mockInput)

    expect(result?.data).toEqual({ success: true, message: 'Mensagem enviada com sucesso!' })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('succeeds even if sendEmail rejects', async () => {
    const mockInput = {
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'Hello, this is a test message.',
    }

    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: { email: 'admin@sistema.com' },
    })
    ;(sendEmail as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('SES down'))

    const result = await sendMessageAction(mockInput)

    expect(result?.data).toEqual({ success: true, message: 'Mensagem enviada com sucesso!' })
    expect(result?.serverError).toBeUndefined()
  })

  it('should reject when trackingCode does not match reportId', async () => {
    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: hashTrackingCode('AP-2026-DIFFERENT'),
      caseNumber: 7,
    })

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'hello',
    })

    expect(result?.serverError).toBe('Acesso negado')
    expect(reportRepository.createMessage).not.toHaveBeenCalled()
  })

  it('accepts the code typed in lowercase or with spaces', async () => {
    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: null,
    })

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: '  ap-2026-test ',
      content: 'hello',
    })

    expect(result?.data?.success).toBe(true)
  })

  it('rejects messages longer than 2000 characters', async () => {
    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'a'.repeat(2001),
    })

    expect(result?.validationErrors).toBeDefined()
    expect(reportRepository.createMessage).not.toHaveBeenCalled()
  })

  it('should reject when report does not exist', async () => {
    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'hello',
    })

    expect(result?.serverError).toBe('Acesso negado')
    expect(reportRepository.createMessage).not.toHaveBeenCalled()
  })

  it('rejects when message rate limit is exceeded', async () => {
    ;(checkMessageRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false })

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'hello',
    })

    expect(result?.serverError).toBe('Muitas mensagens enviadas. Tente novamente em instantes.')
    expect(reportRepository.createMessage).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects when report message cap is reached', async () => {
    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCodeHash: HASH,
      caseNumber: 7,
      assignedTo: { email: 'admin@sistema.com' },
    })
    ;(prisma.message.count as ReturnType<typeof vi.fn>).mockResolvedValue(1000)

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'hello',
    })

    expect(result?.serverError).toBe('Limite de mensagens deste relatório atingido.')
    expect(reportRepository.createMessage).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
