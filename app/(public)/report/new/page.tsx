import { getActiveCategories } from '@/app/_lib/data'
import NewReportForm from './form'

export default async function NewReportPage() {
  const categories = await getActiveCategories()

  return <NewReportForm categories={categories} />
}
