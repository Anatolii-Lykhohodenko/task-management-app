export default function TaskLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="space-y-2 border-b pb-4">
        <div className="h-4 w-12 rounded bg-muted" />
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 w-24 rounded bg-muted" />
          <div className="h-8 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <div className="h-32 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
