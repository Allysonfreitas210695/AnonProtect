import { Suspense } from 'react'
import AdminDashboard from './page'
import { DashboardSkeleton } from '@/_components/shared/dashboard-skeleton'

export default function Loading() {
  return <DashboardSkeleton />
}
