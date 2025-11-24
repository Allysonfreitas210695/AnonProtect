'use server'

import { prisma } from '@/app/_lib/prisma'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const reportId = formData.get('reportId') as string
  const content = formData.get('content') as string
  const code = formData.get('code') as string

  if (!content || !reportId) return

  await prisma.message.create({
    data: {
      reportId,
      content,
      sender: 'USER',
    },
  })

  revalidatePath(`/report/${code}`)
}
