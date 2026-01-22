export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout form skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact information */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              </div>
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            </div>

            {/* Shipping address */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-14 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-14 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-14 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Order summary skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4 sticky top-4">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
              
              {/* Cart items */}
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
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
