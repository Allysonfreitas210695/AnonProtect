import { getCurrentUser } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import { Button } from "@/app/_components/ui/button"
import Link from 'next/link'
import { logout } from '@/app/(public)/login/actions'
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
