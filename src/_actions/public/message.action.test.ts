import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessageAction } from './message.action'
import * as reportRepository from '@/_modules/report/report.data'
import { prisma } from '@/_shared/lib/prisma'

vi.mock('@/_modules/report/report.data', () => ({
  createMessage: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/_shared/lib/prisma', () => ({
  prisma: {
    report: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Message Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a message successfully', async () => {
    const mockInput = {
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'Hello, this is a test message.',
    }

    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCode: 'AP-2026-TEST',
    })

    const result = await sendMessageAction(mockInput)

    expect(result?.data).toEqual({ success: true, message: 'Mensagem enviada com sucesso!' })
    expect(reportRepository.createMessage).toHaveBeenCalledWith(
      mockInput.reportId,
      mockInput.content
    )
  })

  it('should reject when trackingCode does not match reportId', async () => {
    ;(prisma.report.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      trackingCode: 'AP-2026-DIFFERENT',
    })

    const result = await sendMessageAction({
      reportId: 'e8c464ef-5e8f-4f6c-9f6b-8c8f6e4e6f4a',
      code: 'AP-2026-TEST',
      content: 'hello',
    })

    expect(result?.serverError).toBe('Acesso negado')
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
})
