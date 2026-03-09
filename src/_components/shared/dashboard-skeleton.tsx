import { Card, CardContent, CardHeader } from "@/_components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-muted rounded-md" />
        <div className="h-4 w-64 bg-muted rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded mt-1" />
              <div className="h-3 w-32 bg-muted rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border">
        <CardHeader>
          <div className="h-5 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-muted/50 rounded-md" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-[400px] w-full bg-muted/30 rounded-xl border" />
      </div>
    </div>
  )
}
