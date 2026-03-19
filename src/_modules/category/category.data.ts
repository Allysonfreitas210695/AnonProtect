import { prisma } from '@/_shared/lib/prisma'

export async function createCategory(data: {
  name: string
  description?: string
  defaultDepartmentId?: string
}) {
  return await prisma.category.create({
    data,
  })
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  })
}

export async function toggleCategory(id: string, active: boolean) {
  return await prisma.category.update({
    where: { id },
    data: { active },
  })
}
