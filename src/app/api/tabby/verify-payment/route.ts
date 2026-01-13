import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";

const TABBY_API_BASE_URL = "https://api.tabby.ai/api/v2";

interface TabbyPaymentResponse {
  id: string;
  status: "CREATED" | "AUTHORIZED" | "CLOSED" | "REJECTED" | "EXPIRED";
  amount: string;
  currency: string;
  created_at: string;
  expires_at: string;
  is_test: boolean;
  description: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  order: {
    reference_id: string;
    items: Array<{
      title: string;
      quantity: number;
      unit_price: string;
    }>;
  };
  captures: Array<{
    id: string;
    amount: string;
    created_at: string;
  }>;
  refunds: Array<{
    id: string;
    amount: string;
    created_at: string;
    reason: string;
  }>;
  meta?: {
    customer?: string;
    order_id?: string;
  };
}

interface TabbyErrorResponse {
  error?: {
    message: string;
    code: string;
  };
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    const secretKey = getEnvVar("TABBY_SECRET_KEY");
    
    if (!secretKey) {
      console.error("Tabby API Error: TABBY_SECRET_KEY environment variable is not configured");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_api_key",
            message: "Tabby Secret Key is not configured",
          },
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_payment_id",
            message: "Payment ID is required",
          },
        },
        { status: 400 }
      );
    }

    console.log("Tabby verify-payment request:", { paymentId });

    const url = `${TABBY_API_BASE_URL}/payments/${paymentId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
      },
    });

    const data: TabbyPaymentResponse | TabbyErrorResponse = await response.json();

    console.log("Tabby verify-payment response:", {
      status: response.status,
      paymentStatus: "status" in data ? data.status : undefined,
    });

    if (!response.ok) {
      const errorData = data as TabbyErrorResponse;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorData.error?.code || "tabby_error",
            message: errorData.error?.message || errorData.message || "Failed to verify payment",
          },
        },
        { status: response.status }
      );
    }

    const paymentData = data as TabbyPaymentResponse;
    const tabbyStatus = paymentData.status;

    let paymentStatus: "success" | "failed" | "pending";
    let statusMessage: string;

    switch (tabbyStatus) {
      case "AUTHORIZED":
        paymentStatus = "success";
        statusMessage = "Payment authorized successfully";
        break;
      case "CLOSED":
        paymentStatus = "success";
        statusMessage = "Payment completed successfully";
        break;
      case "REJECTED":
        paymentStatus = "failed";
        statusMessage = "Payment was rejected. Please try a different payment method.";
        break;
      case "EXPIRED":
        paymentStatus = "failed";
        statusMessage = "Payment session expired. Please try again.";
        break;
      case "CREATED":
        paymentStatus = "pending";
        statusMessage = "Payment is being processed";
        break;
      default:
        paymentStatus = "pending";
        statusMessage = "Payment status is pending";
    }

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
      status_message: statusMessage,
      payment_id: paymentData.id,
      tabby_status: tabbyStatus,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_reference: paymentData.order?.reference_id,
      is_test: paymentData.is_test,
      captures: paymentData.captures?.length || 0,
      refunds: paymentData.refunds?.length || 0,
    });
  } catch (error) {
    console.error("Tabby verify-payment error:", error);
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
