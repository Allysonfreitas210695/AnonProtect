import { getActiveCategories } from '@/_modules/report/report.query'
import NewReportForm from './_components/form'

export const dynamic = 'force-dynamic'

export default async function NewReportPage() {
  const categories = await getActiveCategories()

  return <NewReportForm categories={categories} />
}
