'use client'

import { Button } from '@/_components/ui/button'
import { Link, usePathname } from '@/i18n/navigation'
import { logoutAction } from '@/_actions/public/logout.action'
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/_components/shared/theme-toggle'
import { LocaleSwitcher } from '@/_components/shared/locale-switcher'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Sidebar')
  const tAdmin = useTranslations('Admin')

  const navItems = [
    {
      href: '/admin',
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/admin/report',
      label: t('reports'),
      icon: FileText,
    },
    ...(user.role === 'ADMIN'
      ? [
          {
            href: '/admin/settings',
            label: t('settings'),
            icon: Settings,
          },
        ]
      : []),
  ]

  const isActive = (href: string) => {
    return pathname === href || (href !== '/admin' && pathname.startsWith(href))
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen transition-colors duration-300">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`border-border bg-card fixed inset-y-0 left-0 z-40 w-72 flex-col border-r transition-transform duration-300 ease-in-out lg:sticky lg:flex lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo & Header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ShieldCheck className="text-primary-foreground h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight">AnonProtect</h1>
                <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                  {tAdmin('areaAdmin')}
                </span>
              </div>
            </div>
            <LocaleSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-lg'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } `}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-border mt-auto flex flex-col gap-4 border-t pt-6">
            <div className="border-border bg-accent/30 flex items-center gap-3 rounded-2xl border p-3">
              <div className="ring-primary/20 text-primary-foreground bg-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                  {user.role}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <form action={logoutAction}>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive group h-10 w-full justify-start gap-3 rounded-xl"
                type="submit"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-semibold">{t('logout')}</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="bg-background/50 min-h-screen flex-1 transition-colors duration-300">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-12">{children}</div>
      </main>
    </div>
  )
}
