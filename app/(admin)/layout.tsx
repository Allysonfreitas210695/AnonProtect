import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}
