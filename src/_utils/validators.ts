export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidTrackingCode(code: string): boolean {
  const codeRegex = /^RPT-[A-Z0-9]{6}$/i
  return codeRegex.test(code)
}

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
