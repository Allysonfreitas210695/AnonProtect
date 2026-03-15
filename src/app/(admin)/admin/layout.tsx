import { Sidebar } from '@/_components/shared/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground ring-offset-background flex min-h-screen antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  )
}
