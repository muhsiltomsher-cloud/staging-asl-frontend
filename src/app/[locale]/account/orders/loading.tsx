export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 skeleton-shimmer rounded" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 skeleton-shimmer rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="h-3 w-32 skeleton-shimmer rounded" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 w-20 skeleton-shimmer rounded" />
              <div className="h-6 w-24 skeleton-shimmer rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
