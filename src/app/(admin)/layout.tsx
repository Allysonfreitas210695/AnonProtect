import { getCurrentUser } from '@/_lib/auth'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './admin-layout-client'
import { prisma } from '@/_lib/prisma'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <AdminLayoutClient user={{ name: user.name ?? 'Admin', role: user.role }}>{children}</AdminLayoutClient>
}
