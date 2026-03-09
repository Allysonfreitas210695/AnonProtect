import { getActiveCategories } from '@/_data-access/public/report.query'
import NewReportForm from './_components/form'

export default async function NewReportPage() {
  const categories = await getActiveCategories()

  return <NewReportForm categories={categories} />
}
