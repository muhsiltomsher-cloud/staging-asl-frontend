import { NextResponse } from "next/server";
import { API_BASE as BASE_URL, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

const ASL_API = `${BASE_URL}/wp-json/asl/v1`;

export interface PublicCoupon {
  code: string;
  description: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
  minimum_amount: string;
  maximum_amount?: string;
  free_shipping: boolean;
}

export async function GET() {
  try {
    const url = `${ASL_API}/coupons`;
    
    const response = await fetch(noCacheUrl(url), {
      method: "GET",
      headers: backendHeaders(),
      next: {
        revalidate: 300,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "coupons_error",
            message: data.message || "Failed to get coupons.",
          },
        },
        { status: response.status }
      );
    }

    const coupons: PublicCoupon[] = (data.coupons || []).map((c: PublicCoupon) => ({
      code: c.code,
      description: c.description || "",
      discount_type: c.discount_type,
      amount: String(c.amount),
      minimum_amount: String(c.minimum_amount || "0"),
      free_shipping: !!c.free_shipping,
    }));

    return NextResponse.json({ success: true, coupons }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      },
      { status: 500 }
    );
  }
}
