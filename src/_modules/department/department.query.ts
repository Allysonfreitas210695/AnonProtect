import 'server-only'

import { prisma } from '@/_shared/lib/prisma'

export async function getAllDepartments() {
  return await prisma.department.findMany({
    orderBy: { name: 'asc' },
  })
}
