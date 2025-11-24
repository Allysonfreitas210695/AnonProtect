'use server'

import { prisma } from '@/app/_lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { reportSchema, reportStatusSchema } from '@/app/_schemas/report'
import type { ActionResult } from '@/app/_types'

export async function createReport(prevState: any, formData: FormData) {
  const data = {
    type: formData.get('type') as string,
    description: formData.get('description') as string,
  }

  const validation = reportSchema.safeParse(data)
  
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || 'Dados inválidos',
    }
  }

  let trackingCode = ''

  try {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    trackingCode = `RPT-${randomPart}`

    await prisma.report.create({
      data: {
        trackingCode,
        type: validation.data.type,
        description: validation.data.description,
      },
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return {
      success: false,
      message: 'Erro ao criar denúncia',
    }
  }

  // Redirect outside try/catch
  redirect(`/report/success?code=${trackingCode}`)
}

export async function updateReportStatus(prevState: any, formData: FormData): Promise<ActionResult> {
  const data = {
    reportId: formData.get('reportId') as string,
    status: formData.get('status') as string,
  }

  const validation = reportStatusSchema.safeParse(data)
  
  if (!validation.success) {
    return {
      success: false,
      message: 'Dados inválidos',
    }
  }

  try {
    await prisma.report.update({
      where: { id: validation.data.reportId },
      data: { status: validation.data.status },
    })

    revalidatePath(`/admin/report/${validation.data.reportId}`)
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    
    return {
      success: true,
      message: 'Status atualizado com sucesso!',
    }
  } catch (error) {
    console.error('Error updating status:', error)
    return {
      success: false,
      message: 'Erro ao atualizar status',
    }
  }
}

export async function assignReport(reportId: string, userId: string): Promise<ActionResult> {
  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { assignedToId: userId },
    })

    revalidatePath(`/admin/report/${reportId}`)
    revalidatePath('/admin')
    
    return {
      success: true,
      message: 'Denúncia atribuída com sucesso!',
    }
  } catch (error) {
    console.error('Error assigning report:', error)
    return {
      success: false,
      message: 'Erro ao atribuir denúncia',
    }
  }
}
