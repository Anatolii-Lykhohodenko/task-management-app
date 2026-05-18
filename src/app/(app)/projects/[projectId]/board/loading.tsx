import { Card, CardContent } from '@/components/ui/card';

export default function BoardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />

      <div className="space-y-2 border-b pb-4">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />

      <div className="space-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:space-y-0">
        <div className="h-8 w-full animate-pulse rounded-md bg-muted sm:w-48" />
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <div className="h-8 w-full animate-pulse rounded-md bg-muted sm:w-36" />
          <div className="h-8 w-full animate-pulse rounded-md bg-muted sm:w-36" />
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border bg-muted/20">
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-6 animate-pulse rounded bg-muted" />
              </div>

              <div className="space-y-2">
                <div className="rounded-md border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-8 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto pb-4 md:block">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-70 shrink-0">
              <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between px-1">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5 animate-pulse rounded bg-muted" />
                </div>

                <div className="space-y-2 rounded-md p-1">
                  {Array.from({ length: i === 1 ? 2 : 1 }).map((_, j) => (
                    <div
                      key={j}
                      className="rounded-md border bg-background p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
