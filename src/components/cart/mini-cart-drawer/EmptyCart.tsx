"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { EmptyCartProps } from "./types";

export function EmptyCart({ locale, dictionary, onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
        <ShoppingBag className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {dictionary.cart}
      </h3>
      <p className="mb-8 text-gray-500">{dictionary.emptyCart}</p>
      <Button asChild variant="primary" size="lg" className="w-full max-w-xs">
        <Link href={`/${locale}/shop`} onClick={onClose}>
          {dictionary.continueShopping}
        </Link>
      </Button>
    </div>
  );
}
