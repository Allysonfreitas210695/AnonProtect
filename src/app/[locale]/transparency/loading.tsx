import { Card, CardContent, CardHeader } from '@/_components/ui/card'

export default function TransparencyLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-12 px-4 py-12">
      <div className="space-y-4 text-center">
        <div className="bg-muted mx-auto h-12 w-64 rounded-md" />
        <div className="bg-muted mx-auto h-6 w-96 rounded-md" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-muted h-40 rounded-2xl" />
        <div className="bg-muted h-40 rounded-2xl" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-6 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] rounded-lg" />
          </CardContent>
        </Card>
        <Card className="ring-border border-none shadow-sm ring-1">
          <CardHeader>
            <div className="bg-muted h-6 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 h-[300px] rounded-lg" />
          </CardContent>
        </Card>
      </div>

      <Card className="ring-border border-none shadow-sm ring-1">
        <CardHeader>
          <div className="bg-muted h-6 w-64 rounded" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 h-[300px] rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
