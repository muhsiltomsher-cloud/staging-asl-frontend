export default function NewProductsLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-12 skeleton-shimmer rounded" />
          <div className="h-4 w-4 skeleton-shimmer rounded" />
          <div className="h-4 w-28 skeleton-shimmer rounded" />
        </div>

        <div className="mb-8">
          <div className="h-9 w-48 skeleton-shimmer rounded" />
          <div className="mt-2 h-4 w-44 skeleton-shimmer rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
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
  );
}
