import { Card, CardContent } from '@/components/ui/card';

export default function TrashLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />

      <div className="border-b pb-4 space-y-2">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-28 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
