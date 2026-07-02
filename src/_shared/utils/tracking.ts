import crypto from 'crypto'

export function generateTrackingCode(): string {
  const year = new Date().getFullYear()
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `AP-${year}-${randomPart}`
}
