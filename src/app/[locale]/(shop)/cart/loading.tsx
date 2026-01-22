export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="h-24 w-24 animate-pulse rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="h-12 w-full animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
