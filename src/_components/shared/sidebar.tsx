'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/_lib/utils'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/_components/ui/button'
import { logoutAction } from '@/_actions/public/logout.action'
import { LocaleSwitcher } from './locale-switcher'

export function Sidebar() {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: t('dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('reports'), href: '/admin/report', icon: FileText },
    { name: t('analytics'), href: '/admin/analytics', icon: BarChart3 },
    { name: t('settings'), href: '/admin/settings', icon: Settings },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-40 w-64 transform border-r transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <ShieldCheck className="text-primary h-8 w-8" />
            <span className="ml-3 text-xl font-bold tracking-tight">AnonProtect</span>
            <div className="ml-auto">
              <LocaleSwitcher />
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname.includes(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full justify-start"
              onClick={() => logoutAction()}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
