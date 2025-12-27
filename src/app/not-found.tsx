import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <div className="text-center">
        <h1 className="mb-2 text-9xl font-bold text-[#C4885B]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 md:text-3xl">
          Page Not Found
        </h2>
        <p className="mx-auto mb-8 max-w-md text-gray-600">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C4885B] px-6 py-3 font-medium uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-[#C4885B] border-2 border-[#C4885B]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/en/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#C4885B] bg-transparent px-6 py-3 font-medium uppercase tracking-wide text-[#C4885B] transition-all duration-300 hover:bg-[#C4885B] hover:text-white"
          >
            <Search className="h-4 w-4" />
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
