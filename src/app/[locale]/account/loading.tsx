export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-sm space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
              {/* Welcome section */}
              <div className="space-y-2">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
              </div>

              {/* Quick stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4 space-y-2">
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
