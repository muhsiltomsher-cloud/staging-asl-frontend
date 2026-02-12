export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-40 skeleton-shimmer rounded" />
          <div className="mx-auto h-4 w-56 skeleton-shimmer rounded" />
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-20 skeleton-shimmer rounded" />
              <div className="h-12 skeleton-shimmer rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 skeleton-shimmer rounded" />
              <div className="h-12 skeleton-shimmer rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 skeleton-shimmer rounded" />
            <div className="h-12 skeleton-shimmer rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 skeleton-shimmer rounded" />
            <div className="h-12 skeleton-shimmer rounded-lg" />
          </div>
          <div className="h-12 w-full skeleton-shimmer rounded-full" />
          <div className="mx-auto h-4 w-40 skeleton-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
