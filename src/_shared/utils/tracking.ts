export function generateTrackingCode(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AP-${year}-${randomPart}`
}
