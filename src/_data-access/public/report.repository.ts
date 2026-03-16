import { prisma } from '@/_lib/prisma'

export async function createReport(data: {
  categoryId: string
  description: string
  country?: string
  state?: string
  city?: string
  district?: string
  postalCode?: string
  priority?: string
}) {
  const year = new Date().getFullYear()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  const trackingCode = `AP-${year}-${randomPart}`

  // Fetch category to get default department
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { defaultDepartmentId: true },
  })

  return await prisma.report.create({
    data: {
      trackingCode,
      categoryId: data.categoryId,
      description: data.description,
      country: data.country,
      state: data.state,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      priority: data.priority,
      assignedDepartmentId: category?.defaultDepartmentId,
    },
  })
}

export async function getCategories() {
  return await prisma.category.findMany({
    where: { active: true },
    select: { name: true },
  })
}

export async function createMessage(reportId: string, content: string) {
  return await prisma.message.create({
    data: {
      reportId,
      content,
      sender: 'USER',
    },
  })
}
