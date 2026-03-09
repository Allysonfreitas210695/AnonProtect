import { prisma } from '@/_lib/prisma'

export async function createCategory(data: { name: string; description?: string | null }) {
  return await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
    },
  })
}

export async function toggleCategory(id: string, active: boolean) {
  return await prisma.category.update({
    where: { id },
    data: { active: !active },
  })
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  })
}
