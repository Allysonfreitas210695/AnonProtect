'use client'

import * as React from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/_components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/_components/ui/dropdown-menu'
import { cn } from '@/_shared/lib/utils'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-50" />
      </Button>
    )
  }

  const themes = [
    { name: 'light', label: 'Claro', icon: Sun },
    { name: 'dark', label: 'Escuro', icon: Moon },
    { name: 'system', label: 'Sistema', icon: Monitor },
  ]

  const ActiveIcon = themes.find((t) => t.name === theme)?.icon || Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <ActiveIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={cn(
              'flex cursor-pointer items-center justify-between',
              theme === t.name && 'bg-accent text-accent-foreground font-medium'
            )}
          >
            <div className="flex items-center gap-2">
              <t.icon className="h-4 w-4" />
              <span>{t.label}</span>
            </div>
            {theme === t.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
