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

export const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  IN_PROGRESS: "default",
  RESOLVED: "outline",
  REJECTED: "destructive",
}
