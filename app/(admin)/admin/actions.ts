'use server'

import { prisma } from '@/app/_lib/prisma'
import { revalidatePath } from 'next/cache'
import { ReportStatus, MessageSender } from '@prisma/client'

export async function updateStatus(formData: FormData) {
  const reportId = formData.get('reportId') as string
  const status = formData.get('status') as ReportStatus

  if (!reportId || !status) {
    throw new Error('Dados inválidos')
  }

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status },
    })

    revalidatePath(`/admin/report/${reportId}`)
    revalidatePath('/admin')

    return { success: true, message: 'Status atualizado com sucesso!' }
  } catch (error) {
    console.error('Error updating status:', error)
    throw new Error('Erro ao atualizar status')
  }
}

export async function replyToReport(formData: FormData) {
  const reportId = formData.get('reportId') as string
  const content = formData.get('content') as string

  if (!content || !reportId) {
    throw new Error('Dados inválidos')
  }

  try {
    await prisma.message.create({
      data: {
        reportId,
        content,
        sender: MessageSender.ADMIN,
      },
    })

    revalidatePath(`/admin/report/${reportId}`)

    return { success: true, message: 'Mensagem enviada!' }
  } catch (error) {
    console.error('Error sending message:', error)
    throw new Error('Erro ao enviar mensagem')
  }
}
