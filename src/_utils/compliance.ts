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
