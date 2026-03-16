'use client'

import { Button } from '@/_components/ui/button'
import { Link, usePathname } from '@/i18n/navigation'
import { logoutAction } from '@/_actions/public/logout.action'
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/_components/shared/theme-toggle'
import { LocaleSwitcher } from '@/_components/shared/locale-switcher'

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
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/report',
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
    return pathname === href || (href !== '/admin' && pathname.startsWith(href))
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100">
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
        className={`fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-zinc-900 bg-zinc-950 transition-transform duration-300 ease-in-out lg:sticky lg:flex lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo & Header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-white">AnonProtect</h1>
                <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                  Área Admin
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
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 ${
                    active
                      ? 'bg-primary text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  } `}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                  />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto flex flex-col gap-4 border-t border-zinc-900 pt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-3">
              <div className="ring-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold ring-2">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <p className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                  {user.role}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <form action={logoutAction}>
              <Button
                variant="ghost"
                className="h-12 w-full justify-start gap-4 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                type="submit"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-semibold">Sair do Sistema</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="min-h-screen flex-1 bg-[#050505]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-12">{children}</div>
      </main>
    </div>
  )
}
