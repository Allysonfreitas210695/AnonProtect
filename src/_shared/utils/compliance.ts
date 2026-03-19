/**
 * Calculates the Average Resolution Time (TTR) in hours.
 */
export function calculateAvgResolutionTime(
  resolvedReports: { createdAt: Date; updatedAt: Date }[]
): number {
  if (resolvedReports.length === 0) return 0

  const totalTime = resolvedReports.reduce((acc, report) => {
    return acc + (report.updatedAt.getTime() - report.createdAt.getTime())
  }, 0)

  const avgHours = totalTime / (resolvedReports.length * 1000 * 60 * 60)

  // Round to 1 decimal place
  return Math.round(avgHours * 10) / 10
}
export function calculateComplianceRate(reports: { createdAt: Date; resolvedAt?: Date | null }[]) {
  if (reports.length === 0) return 0
  const resolvedWithinLimit = reports.filter((r) => {
    if (!r.resolvedAt) return false
    const days = (r.resolvedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return days <= 30
  })
  return Math.round((resolvedWithinLimit.length / reports.length) * 100)
}
