import { prisma } from '@/_shared/lib/prisma'

export async function createDepartment(data: { name: string; description?: string }) {
  return await prisma.department.create({
    data,
  })
}

export async function deleteDepartment(id: string) {
  return await prisma.department.delete({
    where: { id },
  })
}
