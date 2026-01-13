import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";

function getTamaraApiBaseUrl(): string {
  return getEnvVar("TAMARA_TEST_MODE") === "true"
    ? "https://api-sandbox.tamara.co"
    : "https://api.tamara.co";
}

interface TamaraOrderResponse {
  order_id: string;
  order_reference_id: string;
  order_number: string;
  status: "new" | "approved" | "authorised" | "captured" | "fully_captured" | "partially_captured" | "declined" | "canceled" | "expired" | "refunded" | "partially_refunded";
  total_amount: {
    amount: string;
    currency: string;
  };
  consumer: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  billing_address: {
    first_name: string;
    last_name: string;
    line1: string;
    city: string;
    country_code: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    line1: string;
    city: string;
    country_code: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit_price: {
      amount: string;
      currency: string;
    };
  }>;
  created_at: string;
  updated_at: string;
  paid_amount?: {
    amount: string;
    currency: string;
  };
  captured_amount?: {
    amount: string;
    currency: string;
  };
  refunded_amount?: {
    amount: string;
    currency: string;
  };
}

interface TamaraErrorResponse {
  message?: string;
  errors?: Array<{
    error_code: string;
    message: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const apiToken = getEnvVar("TAMARA_API_TOKEN");
    
    if (!apiToken) {
      console.error("Tamara API Error: TAMARA_API_TOKEN environment variable is not configured");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_api_token",
            message: "Tamara API Token is not configured",
          },
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_order_id",
            message: "Order ID is required",
          },
        },
        { status: 400 }
      );
    }

    console.log("Tamara verify-payment request:", { orderId });

    const url = `${getTamaraApiBaseUrl()}/orders/${orderId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    const data: TamaraOrderResponse | TamaraErrorResponse = await response.json();

    console.log("Tamara verify-payment response:", {
      status: response.status,
      orderStatus: "status" in data ? data.status : undefined,
    });

    if (!response.ok) {
      const errorData = data as TamaraErrorResponse;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorData.errors?.[0]?.error_code || "tamara_error",
            message: errorData.errors?.[0]?.message || errorData.message || "Failed to verify payment",
          },
        },
        { status: response.status }
      );
    }

    const orderData = data as TamaraOrderResponse;
    const tamaraStatus = orderData.status;

    let paymentStatus: "success" | "failed" | "pending";
    let statusMessage: string;

    switch (tamaraStatus) {
      case "approved":
      case "authorised":
        paymentStatus = "success";
        statusMessage = "Payment authorized successfully";
        break;
      case "captured":
      case "fully_captured":
        paymentStatus = "success";
        statusMessage = "Payment completed successfully";
        break;
      case "partially_captured":
        paymentStatus = "success";
        statusMessage = "Payment partially captured";
        break;
      case "refunded":
        paymentStatus = "success";
        statusMessage = "Payment has been refunded";
        break;
      case "partially_refunded":
        paymentStatus = "success";
        statusMessage = "Payment has been partially refunded";
        break;
      case "declined":
        paymentStatus = "failed";
        statusMessage = "Payment was declined. Please try a different payment method.";
        break;
      case "canceled":
        paymentStatus = "failed";
        statusMessage = "Payment was canceled.";
        break;
      case "expired":
        paymentStatus = "failed";
        statusMessage = "Payment session expired. Please try again.";
        break;
      case "new":
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
      order_id: orderData.order_id,
      tamara_status: tamaraStatus,
      order_reference: orderData.order_reference_id,
      order_number: orderData.order_number,
      amount: orderData.total_amount?.amount,
      currency: orderData.total_amount?.currency,
      paid_amount: orderData.paid_amount?.amount,
      captured_amount: orderData.captured_amount?.amount,
      refunded_amount: orderData.refunded_amount?.amount,
    });
  } catch (error) {
    console.error("Tamara verify-payment error:", error);
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
