export const REPORT_TYPES: Record<string, string> = {
  BULLYING: 'Bullying',
  HARASSMENT: 'Assédio',
  VIOLENCE: 'Violência',
  IRREGULARITY: 'Irregularidade',
  DISCRIMINATION: 'Discriminação',
  THEFT: 'Furto/Roubo',
  VANDALISM: 'Vandalismo',
  OTHER: 'Outro',
}

export const REPORT_STATUS: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Análise',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
}

export const STATUS_COLORS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  REJECTED: 'destructive',
}
