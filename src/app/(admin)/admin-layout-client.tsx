'use client'

import { Button } from '@/_components/ui/button'
import Link from 'next/link'
import { logoutAction } from '@/_actions/public/logout.action'
import { LayoutDashboard, FileText, Settings, LogOut, User, Shield, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/_components/shared/theme-toggle'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
  }
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin',
      label: 'Denúncias',
      icon: FileText,
    },
    ...(user.role === 'ADMIN'
      ? [
          {
            href: '/admin/settings',
            label: 'Configurações',
            icon: Settings,
          },
        ]
      : []),
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo e Menu Mobile */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                <Shield className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">Painel Admin</h1>
                <p className="text-xs text-muted-foreground">Sistema de Denúncias</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 rounded-lg bg-secondary px-3 py-2 md:flex">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-card shadow-lg transition-transform duration-300 ease-in-out lg:sticky lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 font-medium text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="min-h-[calc(100vh-4rem)] flex-1">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-4 lg:py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Sistema de Denúncias Anônimas - Área Administrativa</p>
        </div>
      </footer>
    </div>
  )
}
