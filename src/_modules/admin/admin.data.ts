import { ReportStatus } from '@/_generated/prisma'
import { prisma } from '@/_shared/lib/prisma'
import { encrypt } from '@/_shared/lib/crypto'

export async function softDeleteReport(id: string) {
  return await prisma.report.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function updateReportStatus(id: string, status: ReportStatus, userId?: string) {
  const report = await prisma.report.update({
    where: { id },
    data: { status },
  })

  if (userId) {
    await prisma.activityLog.create({
      data: {
        reportId: id,
        userId,
        action: 'STATUS_CHANGED',
        description: `Status alterado para ${status}`,
      },
    })
  }

  return report
}

export async function createAdminReply(reportId: string, authorId: string, content: string) {
  return await prisma.$transaction([
    prisma.message.create({
      data: {
        reportId,
        content: encrypt(content),
        sender: 'ADMIN',
      },
    }),
    prisma.activityLog.create({
      data: {
        reportId,
        userId: authorId,
        action: 'MESSAGE_SENT',
        description: 'Administrador enviou uma resposta ao denunciante',
      },
    }),
  ])
}

export async function createInvestigationNote(reportId: string, authorId: string, content: string) {
  return await prisma.$transaction([
    prisma.investigationNote.create({
      data: { reportId, userId: authorId, content: encrypt(content) },
    }),
    prisma.activityLog.create({
      data: {
        reportId,
        userId: authorId,
        action: 'NOTE_ADDED',
        description: 'Nova nota de investigação adicionada',
      },
    }),
  ])
}

export async function deleteInvestigationNote(id: string, userId: string, reportId: string) {
  return await prisma.$transaction([
    prisma.investigationNote.delete({ where: { id } }),
    prisma.activityLog.create({
      data: {
        reportId,
        userId,
        action: 'NOTE_ADDED',
        description: 'Nota de investigação removida',
      },
    }),
  ])
}

export async function forwardReport(
  id: string,
  departmentId: string,
  userId: string,
  description: string
) {
  return await prisma.$transaction([
    prisma.report.update({
      where: { id },
      data: {
        assignedDepartmentId: departmentId,
        status: 'IN_PROGRESS',
      },
    }),
    prisma.activityLog.create({
      data: {
        reportId: id,
        userId,
        action: 'DEPARTMENT_CHANGED',
        description: description || `Denúncia encaminhada para outro departamento`,
      },
    }),
  ])
}

export async function updateReportsStatus(ids: string[], status: ReportStatus) {
  return await prisma.report.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
}

export async function logReportView(reportId: string, userId: string) {
  return await prisma.activityLog.create({
    data: {
      reportId,
      userId,
      action: 'VIEWED',
      description: 'Administrador visualizou os detalhes da denúncia',
    },
  })
}
