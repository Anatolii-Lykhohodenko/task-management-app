export default function EditTaskLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-xl">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="h-4 w-14 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-14 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </div>
      <div className="h-10 w-28 rounded bg-muted" />
    </div>
  );
}
