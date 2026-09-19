export function ScreenLoader() {
  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-bg px-4 pt-16">
      <div className="h-8 w-40 animate-pulse rounded-md bg-surface-2" />
      <div className="h-16 animate-pulse rounded-xl bg-surface-2" />
      <div className="h-44 animate-pulse rounded-xl bg-surface-2" />
      <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
    </div>
  );
}
