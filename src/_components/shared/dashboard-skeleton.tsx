import { Card, CardContent, CardHeader } from '@/_components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="bg-muted h-10 w-48 rounded-md" />
        <div className="bg-muted h-4 w-64 rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="ring-border border-none shadow-sm ring-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="bg-muted h-4 w-20 rounded" />
              <div className="bg-muted h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mt-1 h-8 w-12 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-5 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-5 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-5 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-5 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
