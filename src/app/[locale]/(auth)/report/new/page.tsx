import { getActiveCategories } from '@/_data-access/public/report.query'
import NewReportForm from './_components/form'
import { RateLimitGuard } from '@/_components/shared/rate-limit-guard'

export default async function NewReportPage() {
  const categories = await getActiveCategories()

  return (
    <RateLimitGuard>
      <NewReportForm categories={categories} />
    </RateLimitGuard>
  )
}
