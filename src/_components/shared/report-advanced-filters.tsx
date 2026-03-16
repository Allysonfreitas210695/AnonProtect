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

interface Category {
  id: string
  name: string
}

interface ReportAdvancedFiltersProps {
  categories: Category[]
  countries: string[]
  cities: string[]
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Análise',
  RESOLVED: 'Resolvida',
  REJECTED: 'Rejeitada',
}

export function ReportAdvancedFilters({
  categories,
  countries,
  cities,
}: ReportAdvancedFiltersProps) {
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
    params.delete('page') // Reset pagination

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('category')
    params.delete('country')
    params.delete('city')
    params.delete('page')

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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={currentStatus} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="bg-card/50 border-border/50 h-9 w-[140px] rounded-xl text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          {Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentCategory} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="bg-card/50 border-border/50 h-9 w-[140px] rounded-xl text-xs">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {countries.length > 0 && (
        <Select value={currentCountry} onValueChange={(v) => updateFilter('country', v)}>
          <SelectTrigger className="bg-card/50 border-border/50 h-9 w-[140px] rounded-xl text-xs">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Países</SelectItem>
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
          <SelectTrigger className="bg-card/50 border-border/50 h-9 w-[140px] rounded-xl text-xs">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Cidades</SelectItem>
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
          className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 rounded-xl px-2 text-xs transition-all"
        >
          <X className="mr-1 h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  )
}
