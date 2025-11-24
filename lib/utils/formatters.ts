import { REPORT_STATUS, REPORT_TYPES } from '../constants'

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }
  
  return dateObj.toLocaleDateString('pt-BR', defaultOptions)
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} às ${formatTime(date)}`
}

export function formatStatus(status: string): string {
  return REPORT_STATUS[status] || status
}

export function formatCategory(category: string): string {
  return REPORT_TYPES[category] || category
}

export function formatTrackingCode(code: string): string {
  return code.toUpperCase()
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
