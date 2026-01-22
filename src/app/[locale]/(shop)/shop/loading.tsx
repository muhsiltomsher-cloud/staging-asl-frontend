export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Filters and sorting skeleton */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square animate-pulse rounded-xl bg-gray-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
