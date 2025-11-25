'use server'

import { prisma } from '@/app/_lib/prisma'
import { revalidatePath } from 'next/cache'
import { messageSchema } from '@/app/_schemas/category'
import type { ActionResult } from '@/app/_types'
import { MessageSender } from '@prisma/client'

export async function sendMessage(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const data = {
    reportId: formData.get('reportId') as string,
    content: formData.get('content') as string,
  }

  const validation = messageSchema.safeParse(data)

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    }
  }

  const sender = (formData.get('sender') as MessageSender) || MessageSender.USER
  const code = formData.get('code') as string

  try {
    await prisma.message.create({
      data: {
        reportId: validation.data.reportId,
        content: validation.data.content,
        sender,
      },
    })

    if (code) {
      revalidatePath(`/report/${code}`)
    }
    revalidatePath(`/admin/report/${validation.data.reportId}`)

    return {
      success: true,
      message: 'Mensagem enviada!',
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return {
      success: false,
      message: 'Erro ao enviar mensagem',
    }
  }
}

export async function sendAdminReply(prevState: any, formData: FormData): Promise<ActionResult> {
  const reportId = formData.get('reportId') as string
  const content = formData.get('content') as string

  const validation = messageSchema.safeParse({ reportId, content })

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    }
  }

  try {
    await prisma.message.create({
      data: {
        reportId: validation.data.reportId,
        content: validation.data.content,
        sender: MessageSender.ADMIN,
      },
    })

    revalidatePath(`/admin/report/${reportId}`)

    return {
      success: true,
      message: 'Mensagem enviada!',
    }
  } catch (error) {
    console.error('Error sending admin reply:', error)
    return {
      success: false,
      message: 'Erro ao enviar mensagem',
    }
  }
}
