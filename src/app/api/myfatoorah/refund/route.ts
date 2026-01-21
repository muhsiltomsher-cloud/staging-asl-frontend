import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { siteConfig } from "@/config/site";

const WC_API_BASE = `${siteConfig.apiUrl}/wp-json/wc/v3`;

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

// Create a refund in WooCommerce and optionally restock items
async function createWooCommerceRefund(
  orderId: number,
  amount: number,
  reason: string,
  restockItems: boolean = true
): Promise<{ success: boolean; refund_id?: number; error?: string }> {
  try {
    const url = `${WC_API_BASE}/orders/${orderId}/refunds?${getBasicAuthParams()}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        reason: reason,
        restock_items: restockItems,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WooCommerce refund error:", data);
      return {
        success: false,
        error: data.message || "Failed to create WooCommerce refund",
      };
    }

    return {
      success: true,
      refund_id: data.id,
    };
  } catch (error) {
    console.error("WooCommerce refund network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error creating WooCommerce refund",
    };
  }
}

// Update WooCommerce order status and add refund metadata
async function updateOrderWithRefundDetails(
  orderId: number,
  refundId: number,
  refundReference: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${WC_API_BASE}/orders/${orderId}?${getBasicAuthParams()}`;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_data: [
          { key: "_myfatoorah_refund_id", value: refundId.toString() },
          { key: "_myfatoorah_refund_reference", value: refundReference },
          { key: "_myfatoorah_refund_amount", value: amount.toString() },
          { key: "_myfatoorah_refund_date", value: new Date().toISOString() },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WooCommerce order update error:", data);
      return {
        success: false,
        error: data.message || "Failed to update order with refund details",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("WooCommerce order update network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error updating order",
    };
  }
}

function getMyFatoorahApiBaseUrl(): string {
  if (getEnvVar("MYFATOORAH_TEST_MODE") === "true") {
    return "https://apitest.myfatoorah.com";
  }
  
  const country = (getEnvVar("MYFATOORAH_COUNTRY") || "KWT").toUpperCase();
  
  switch (country) {
    case "AE":
    case "UAE":
      return "https://api-ae.myfatoorah.com";
    case "SA":
    case "SAU":
      return "https://api-sa.myfatoorah.com";
    case "QA":
    case "QAT":
      return "https://api-qa.myfatoorah.com";
    case "EG":
    case "EGY":
      return "https://api-eg.myfatoorah.com";
    case "PORTAL":
    case "MAIN":
    case "KW":
    case "KWT":
    case "BH":
    case "BHR":
    case "JO":
    case "JOR":
    case "OM":
    case "OMN":
    default:
      return "https://api.myfatoorah.com";
  }
}

interface MakeRefundRequest {
  payment_id?: string;
  invoice_id?: string;
  amount: number;
  comment?: string;
  service_charge_on_customer?: boolean;
  // WooCommerce order details for syncing refund with order
  order_id?: number;
  restock_items?: boolean;
}

interface MakeRefundResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    Key: string;
    RefundId: number;
    RefundReference: string;
    Amount: number;
    Comment: string;
  } | null;
}

interface GetRefundStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    RefundStatusResult: Array<{
      RefundId: number;
      RefundStatus: "Refunded" | "Canceled" | "Pending";
      InvoiceId: number;
      Amount: number;
      RefundReference: string;
      RefundAmount: number;
    }>;
  } | null;
}

// POST - Make a refund request
export async function POST(request: NextRequest) {
  try {
    const apiKey = getEnvVar("MYFATOORAH_API_KEY");
    
    if (!apiKey) {
      console.error("MyFatoorah API Error: MYFATOORAH_API_KEY environment variable is not configured");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_api_key",
            message: "MyFatoorah API key is not configured",
          },
        },
        { status: 500 }
      );
    }

    const body: MakeRefundRequest = await request.json();

    if (!body.payment_id && !body.invoice_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_key",
            message: "Either payment_id or invoice_id is required",
          },
        },
        { status: 400 }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_amount",
            message: "Amount must be greater than 0",
          },
        },
        { status: 400 }
      );
    }

    const keyType = body.payment_id ? "PaymentId" : "InvoiceId";
    const key = body.payment_id || body.invoice_id;

    console.log("MyFatoorah refund request:", { keyType, key, amount: body.amount });

    const url = `${getMyFatoorahApiBaseUrl()}/v2/MakeRefund`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        KeyType: keyType,
        Key: key,
        Amount: body.amount,
        Comment: body.comment || "Refund requested via API",
        ServiceChargeOnCustomer: body.service_charge_on_customer || false,
      }),
    });

    const data: MakeRefundResponse = await response.json();

    console.log("MyFatoorah refund response:", {
      isSuccess: data.IsSuccess,
      refundId: data.Data?.RefundId,
      refundReference: data.Data?.RefundReference,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "refund_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to process refund",
          },
        },
        { status: response.status || 400 }
      );
    }

    const refundId = data.Data?.RefundId;
    const refundReference = data.Data?.RefundReference || "";
    const refundAmount = data.Data?.Amount || body.amount;

    // If order_id is provided, sync the refund with WooCommerce
    let wooCommerceRefundResult: { success: boolean; wc_refund_id?: number; error?: string } = { success: true };
    let orderUpdateResult: { success: boolean; error?: string } = { success: true };

    if (body.order_id && refundId) {
      // Create a refund record in WooCommerce (this also restores stock if restock_items is true)
      wooCommerceRefundResult = await createWooCommerceRefund(
        body.order_id,
        refundAmount,
        body.comment || `MyFatoorah Refund #${refundReference}`,
        body.restock_items !== false // Default to true for restocking
      );

      if (wooCommerceRefundResult.success) {
        console.log("WooCommerce refund created:", { wc_refund_id: wooCommerceRefundResult.refund_id });
      } else {
        console.error("WooCommerce refund failed:", wooCommerceRefundResult.error);
      }

      // Update the order with MyFatoorah refund metadata
      orderUpdateResult = await updateOrderWithRefundDetails(
        body.order_id,
        refundId,
        refundReference,
        refundAmount
      );

      if (orderUpdateResult.success) {
        console.log("Order updated with refund details");
      } else {
        console.error("Order update failed:", orderUpdateResult.error);
      }
    }

    return NextResponse.json({
      success: true,
      refund_id: refundId,
      refund_reference: refundReference,
      amount: refundAmount,
      comment: data.Data?.Comment,
      message: "Refund request submitted successfully. It will be processed by MyFatoorah finance team.",
      // Include WooCommerce sync status
      woocommerce_sync: body.order_id ? {
        refund_created: wooCommerceRefundResult.success,
        wc_refund_id: wooCommerceRefundResult.refund_id,
        order_updated: orderUpdateResult.success,
        stock_restored: body.restock_items !== false && wooCommerceRefundResult.success,
        errors: [
          wooCommerceRefundResult.error,
          orderUpdateResult.error,
        ].filter(Boolean),
      } : undefined,
    });
  } catch (error) {
    console.error("MyFatoorah refund error:", error);
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

// GET - Get refund status
export async function GET(request: NextRequest) {
  try {
    const apiKey = getEnvVar("MYFATOORAH_API_KEY");
    
    if (!apiKey) {
      console.error("MyFatoorah API Error: MYFATOORAH_API_KEY environment variable is not configured");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_api_key",
            message: "MyFatoorah API key is not configured",
          },
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const refundId = searchParams.get("refund_id");
    const refundReference = searchParams.get("refund_reference");
    const invoiceId = searchParams.get("invoice_id");

    if (!refundId && !refundReference && !invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_key",
            message: "Either refund_id, refund_reference, or invoice_id is required",
          },
        },
        { status: 400 }
      );
    }

    let keyType: string;
    let key: string;

    if (refundId) {
      keyType = "RefundId";
      key = refundId;
    } else if (refundReference) {
      keyType = "RefundReference";
      key = refundReference;
    } else {
      keyType = "InvoiceId";
      key = invoiceId!;
    }

    console.log("MyFatoorah get refund status request:", { keyType, key });

    const url = `${getMyFatoorahApiBaseUrl()}/v2/GetRefundStatus`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        KeyType: keyType,
        Key: key,
      }),
    });

    const data: GetRefundStatusResponse = await response.json();

    console.log("MyFatoorah get refund status response:", {
      isSuccess: data.IsSuccess,
      refundCount: data.Data?.RefundStatusResult?.length,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "refund_status_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to get refund status",
          },
        },
        { status: response.status || 400 }
      );
    }

    const refunds = data.Data?.RefundStatusResult?.map((refund) => ({
      refund_id: refund.RefundId,
      refund_status: refund.RefundStatus.toLowerCase(),
      invoice_id: refund.InvoiceId,
      amount: refund.Amount,
      refund_reference: refund.RefundReference,
      refund_amount: refund.RefundAmount,
    })) || [];

    return NextResponse.json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error("MyFatoorah get refund status error:", error);
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
