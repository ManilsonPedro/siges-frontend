export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64" />
      <div className="h-24 bg-surface dark:bg-surface rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20" />
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface dark:bg-surface rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-surface dark:bg-surface rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20" />
    </div>
  );
}
