import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>;
}

function LoadingFallback() {
  return (
    <div 
      className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12"
      style={{ 
        backgroundImage: 'url(https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/page-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#E8E0D5] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="h-8 w-48 mx-auto bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 mx-auto mt-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-5">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale } = await params;
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm locale={locale} />
    </Suspense>
  );
}
