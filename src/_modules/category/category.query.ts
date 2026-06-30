import 'server-only'

import { prisma } from '@/_shared/lib/prisma'

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
}
