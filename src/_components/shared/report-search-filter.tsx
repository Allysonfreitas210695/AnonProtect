'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/_components/ui/input'
import { Search, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

export function ReportSearchFilter() {
  const t = useTranslations('Admin.Filters')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [value, setValue] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const search = searchParams.get('search') || ''
    if (search !== value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(search)
    }
  }, [searchParams, value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get('search') || ''

      if (value === currentSearch) return

      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
        params.delete('page')
      } else {
        params.delete('search')
      }

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    }, 800)

    return () => clearTimeout(timeout)
  }, [value, router, searchParams, startTransition])

  const clearSearch = () => {
    setValue('')
  }

  return (
    <div className="group relative w-full transition-all duration-300 md:max-w-xs">
      <div className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3 -translate-y-1/2 transition-colors">
        <Search className="h-4 w-4" />
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="bg-card/50 focus-visible:ring-primary/20 h-10 w-full rounded-xl border-none pr-10 pl-10 shadow-sm transition-all focus-visible:border-none"
      />
      {value && (
        <button
          onClick={clearSearch}
          aria-label={t('clear')}
          title={t('clear')}
          className="hover:bg-muted text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-all active:scale-90"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <div className="via-primary/50 absolute -bottom-1 left-0 h-px w-full animate-pulse bg-linear-to-r from-transparent to-transparent" />
    </div>
  )
}
