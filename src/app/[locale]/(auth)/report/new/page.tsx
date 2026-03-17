import { getActiveCategories } from '@/_data-access/public/report.query'
import NewReportForm from './_components/form'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/_lib/ratelimit'
import { RateLimitError } from '@/_components/shared/rate-limit-error'

export default async function NewReportPage() {
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
  const { success } = await checkRateLimit(ip)

  if (!success) {
    return <RateLimitError />
  }

  const categories = await getActiveCategories()

  return <NewReportForm categories={categories} />
}
