export function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-10 h-64 shimmer" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-24 rounded-2xl shimmer" />
        <div className="h-24 rounded-2xl shimmer" />
      </div>
      <div className="h-40 rounded-2xl shimmer" />
      <div className="h-80 rounded-2xl shimmer" />
    </div>
  );
}
