export default function ProjectLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
