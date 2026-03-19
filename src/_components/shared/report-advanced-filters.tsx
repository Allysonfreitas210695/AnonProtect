'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { X } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/_components/ui/button'
import { useTranslations } from 'next-intl'

interface Category {
  id: string
  name: string
}

interface ReportAdvancedFiltersProps {
  categories: Category[]
  countries: string[]
  cities: string[]
}

const REPORT_STATUS_KEYS = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const

export function ReportAdvancedFilters({
  categories,
  countries,
  cities,
}: ReportAdvancedFiltersProps) {
  const t = useTranslations('Admin.Filters')
  const tS = useTranslations('Status')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentStatus = searchParams.get('status') || 'all'
  const currentCategory = searchParams.get('category') || 'all'
  const currentCountry = searchParams.get('country') || 'all'
  const currentCity = searchParams.get('city') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    const keysToRemove = ['status', 'category', 'country', 'city', 'page']
    keysToRemove.forEach((key) => params.delete(key))

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const hasActiveFilters =
    currentStatus !== 'all' ||
    currentCategory !== 'all' ||
    currentCountry !== 'all' ||
    currentCity !== 'all'

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <Select value={currentStatus} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="bg-card/50 h-9 w-full rounded-xl border-none text-xs shadow-sm sm:w-[140px]">
          <SelectValue placeholder={t('statusPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allStatus')}</SelectItem>
          {REPORT_STATUS_KEYS.map((value) => (
            <SelectItem key={value} value={value}>
              {tS(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentCategory} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="bg-card/50 h-9 w-full rounded-xl border-none text-xs shadow-sm sm:w-[140px]">
          <SelectValue placeholder={t('categoryPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {countries.length > 0 && (
        <Select value={currentCountry} onValueChange={(v) => updateFilter('country', v)}>
          <SelectTrigger className="bg-card/50 h-9 w-full rounded-xl border-none text-xs shadow-sm sm:w-[140px]">
            <SelectValue placeholder={t('countryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCountries')}</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {cities.length > 0 && (
        <Select value={currentCity} onValueChange={(v) => updateFilter('city', v)}>
          <SelectTrigger className="bg-card/50 h-9 w-full rounded-xl border-none text-xs shadow-sm sm:w-[140px]">
            <SelectValue placeholder={t('cityPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCities')}</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground hover:bg-muted col-span-2 h-9 rounded-xl px-2 text-xs transition-all sm:col-auto"
        >
          <X className="mr-1 h-3 w-3" />
          {t('clear')}
        </Button>
      )}
    </div>
  )
}
