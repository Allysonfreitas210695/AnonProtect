import { prisma } from '@/_lib/prisma'
import { ReportStatus } from '@/_generated/prisma'

export async function updateReportStatus(id: string, status: ReportStatus) {
  return await prisma.report.update({
    where: { id },
    data: { status },
  })
}

export async function createAdminReply(reportId: string, content: string) {
  return await prisma.message.create({
    data: {
      reportId,
      content,
      sender: 'ADMIN',
    },
  })
}

export async function createInvestigationNote(reportId: string, userId: string, content: string) {
  return await prisma.investigationNote.create({
    data: {
      reportId,
      userId,
      content,
    },
  })
}

export async function getInvestigationNoteById(id: string) {
  return await prisma.investigationNote.findUnique({
    where: { id },
  })
}

export async function deleteInvestigationNote(noteId: string) {
  return await prisma.investigationNote.delete({
    where: { id: noteId },
  })
}

export async function forwardReport(
  reportId: string,
  departmentId: string,
  userId: string,
  description: string
) {
  return await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { assignedDepartmentId: departmentId },
    }),
    prisma.activityLog.create({
      data: {
        reportId,
        userId,
        action: 'DEPARTMENT_CHANGED',
        description,
        metadata: JSON.stringify({ departmentId }),
      },
    }),
  ])
}

export async function updateReportsStatus(ids: string[], status: ReportStatus) {
  return await prisma.report.updateMany({
    where: {
      id: { in: ids },
    },
    data: { status },
  })
}
