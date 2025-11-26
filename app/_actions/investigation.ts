'use server'

import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'
import { prisma } from '@/app/_lib/prisma'
import { z } from 'zod'
import { ActivityAction } from '@prisma/client'

const investigationNoteSchema = z.object({
  reportId: z.string().uuid(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
  reportId: z.string().uuid(),
})

export async function createInvestigationNote(prevState: unknown, formData: FormData) {
  try {
    const data = {
      reportId: formData.get('reportId') as string,
      content: formData.get('content') as string,
    }

    const validated = investigationNoteSchema.parse(data)

    // Retrieve a user ID (e.g., the first ADMIN) as a fallback for development
    const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })

    if (!adminUser) {
      throw new Error('Nenhum administrador encontrado para associar à nota')
    }

    const userId = adminUser.id

    await prisma.investigationNote.create({
      data: {
        reportId: validated.reportId,
        userId,
        content: validated.content,
      },
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        reportId: validated.reportId,
        userId,
        action: ActivityAction.NOTE_ADDED,
        description: 'Nota de investigação adicionada',
      },
    })

    revalidatePath(`/admin/report/${validated.reportId}`)

    return {
      success: true,
      message: 'Nota adicionada com sucesso',
    }
  } catch (error) {
    console.error('Error creating investigation note:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao adicionar nota',
    }
  }
}

export async function deleteInvestigationNote(prevState: unknown, formData: FormData) {
  try {
    const data = {
      noteId: formData.get('noteId') as string,
      reportId: formData.get('reportId') as string,
    }

    const validated = deleteNoteSchema.parse(data)

    await prisma.investigationNote.delete({
      where: { id: validated.noteId },
    })

    revalidatePath(`/admin/report/${validated.reportId}`)

    return {
      success: true,
      message: 'Nota excluída com sucesso',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao excluir nota',
    }
  }
}

export async function logActivity(
  reportId: string,
  action: ActivityAction,
  description: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activityLog.create({
      data: {
        reportId,
        userId,
        action,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
