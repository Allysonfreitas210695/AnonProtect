import { prisma } from '@/_lib/prisma'

export async function getAllDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
  })
}

export async function createDepartment(name: string, description?: string) {
  return prisma.department.create({
    data: { name, description },
  })
}
