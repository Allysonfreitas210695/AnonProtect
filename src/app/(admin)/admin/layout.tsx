import { getCurrentUser } from '@/_lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/_components/ui/button'
import Link from 'next/link'
import { loginAction } from '@/_actions/public/login.action'
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react'

import { Sidebar } from '@/_components/shared/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground ring-offset-background antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}

