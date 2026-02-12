export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      <div className="relative h-[60vh] w-full skeleton-shimmer" />

      <div className="bg-[#f7f6f2] py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center space-y-2">
            <div className="mx-auto h-6 w-48 skeleton-shimmer rounded" />
            <div className="mx-auto h-4 w-64 skeleton-shimmer rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square skeleton-shimmer rounded-xl" />
                <div className="h-3 w-16 skeleton-shimmer rounded" />
                <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                <div className="h-4 w-1/2 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center space-y-2">
            <div className="mx-auto h-6 w-56 skeleton-shimmer rounded" />
            <div className="mx-auto h-4 w-40 skeleton-shimmer rounded" />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square skeleton-shimmer rounded-2xl" />
                <div className="mx-auto h-4 w-24 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f7f6f2] py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center space-y-2">
            <div className="mx-auto h-6 w-48 skeleton-shimmer rounded" />
            <div className="mx-auto h-4 w-64 skeleton-shimmer rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square skeleton-shimmer rounded-xl" />
                <div className="h-3 w-16 skeleton-shimmer rounded" />
                <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                <div className="h-4 w-1/2 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
