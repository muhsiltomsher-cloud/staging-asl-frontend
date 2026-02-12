export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 skeleton-shimmer rounded" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout form skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact information */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 skeleton-shimmer rounded" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-12 skeleton-shimmer rounded-lg" />
                <div className="h-12 skeleton-shimmer rounded-lg" />
              </div>
              <div className="h-12 skeleton-shimmer rounded-lg" />
              <div className="h-12 skeleton-shimmer rounded-lg" />
            </div>

            {/* Shipping address */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 skeleton-shimmer rounded" />
              <div className="h-12 skeleton-shimmer rounded-lg" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-12 skeleton-shimmer rounded-lg" />
                <div className="h-12 skeleton-shimmer rounded-lg" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-12 skeleton-shimmer rounded-lg" />
                <div className="h-12 skeleton-shimmer rounded-lg" />
                <div className="h-12 skeleton-shimmer rounded-lg" />
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-40 skeleton-shimmer rounded" />
              <div className="space-y-3">
                <div className="h-14 skeleton-shimmer rounded-lg" />
                <div className="h-14 skeleton-shimmer rounded-lg" />
                <div className="h-14 skeleton-shimmer rounded-lg" />
              </div>
            </div>
          </div>

          {/* Order summary skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-4 sticky top-4">
              <div className="h-6 w-32 skeleton-shimmer rounded" />
              
              {/* Cart items */}
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-16 skeleton-shimmer rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                      <div className="h-3 w-1/4 skeleton-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 skeleton-shimmer rounded" />
                  <div className="h-4 w-16 skeleton-shimmer rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 skeleton-shimmer rounded" />
                  <div className="h-4 w-16 skeleton-shimmer rounded" />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <div className="h-5 w-16 skeleton-shimmer rounded" />
                  <div className="h-5 w-20 skeleton-shimmer rounded" />
                </div>
              </div>

              <div className="h-12 w-full skeleton-shimmer rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
