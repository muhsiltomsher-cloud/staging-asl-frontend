"use client";

import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import type { ReactNode } from "react";

interface PullToRefreshWrapperProps {
  children: ReactNode;
}

export function PullToRefreshWrapper({ children }: PullToRefreshWrapperProps) {
  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  );
}
