import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { siteConfig } from "@/config/site";

const WC_API_BASE = `${siteConfig.apiUrl}/wp-json/wc/v3`;

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

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

interface MyFatoorahPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    Invoice: {
      Id: string;
      Status: "PAID" | "PENDING" | "EXPIRED";
      Reference: string;
      UserDefinedField: string;
    };
    Transaction: {
      Id: string;
      Status: "SUCCESS" | "FAILED" | "INPROGRESS" | "AUTHORIZE" | "CANCELED";
      PaymentMethod: string;
      PaymentId: string;
      ReferenceId: string;
      TransactionDate: string;
      IP: {
        Address: string;
        Country: string;
      };
      Card: {
        NameOnCard: string;
        Number: string;
        Brand: string;
        Issuer: string;
        IssuerCountry: string;
        FundingMethod: string;
      } | null;
    };
    Amount: {
      BaseCurrency: string;
      ValueInBaseCurrency: string;
      DisplayCurrency: string;
      ValueInDisplayCurrency: string;
    };
  } | null;
}

interface WooCommerceOrder {
  id: number;
  status: string;
  payment_method: string;
  transaction_id: string;
  meta_data: Array<{ key: string; value: string }>;
}

interface SyncResult {
  order_id: number;
  previous_status: string;
  new_status: string;
  payment_status: string;
  payment_method?: string;
  transaction_id?: string;
  card_brand?: string;
  customer_ip?: string;
  synced: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getEnvVar("MYFATOORAH_API_KEY");
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: "missing_api_key", message: "MyFatoorah API key is not configured" } },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { order_ids, payment_ids } = body;

    if (!order_ids && !payment_ids) {
      return NextResponse.json(
        { success: false, error: { code: "missing_params", message: "Either order_ids or payment_ids array is required" } },
        { status: 400 }
      );
    }

    const results: SyncResult[] = [];

    if (payment_ids && Array.isArray(payment_ids)) {
      for (const paymentId of payment_ids) {
        try {
          const paymentResult = await syncByPaymentId(paymentId, apiKey);
          results.push(paymentResult);
        } catch (error) {
          results.push({
            order_id: 0,
            previous_status: "unknown",
            new_status: "unknown",
            payment_status: "error",
            synced: false,
            message: error instanceof Error ? error.message : "Failed to sync payment",
          });
        }
      }
    }

    if (order_ids && Array.isArray(order_ids)) {
      for (const orderId of order_ids) {
        try {
          const orderResult = await syncByOrderId(orderId, apiKey);
          results.push(orderResult);
        } catch (error) {
          results.push({
            order_id: orderId,
            previous_status: "unknown",
            new_status: "unknown",
            payment_status: "error",
            synced: false,
            message: error instanceof Error ? error.message : "Failed to sync order",
          });
        }
      }
    }

    const syncedCount = results.filter(r => r.synced).length;
    
    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} of ${results.length} orders`,
      results,
    });
  } catch (error) {
    console.error("Sync orders error:", error);
    return NextResponse.json(
      { success: false, error: { code: "sync_error", message: error instanceof Error ? error.message : "Sync failed" } },
      { status: 500 }
    );
  }
}

async function syncByPaymentId(paymentId: string, apiKey: string): Promise<SyncResult> {
  const url = `${getMyFatoorahApiBaseUrl()}/v3/payments/${paymentId}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data: MyFatoorahPaymentResponse = await response.json();

  if (!response.ok || !data.IsSuccess || !data.Data) {
    return {
      order_id: 0,
      previous_status: "unknown",
      new_status: "unknown",
      payment_status: "not_found",
      synced: false,
      message: data.Message || "Payment not found in MyFatoorah",
    };
  }

  const customerReference = data.Data.Invoice.UserDefinedField;
  const orderIdMatch = customerReference?.match(/WC-(\d+)/);
  
  if (!orderIdMatch) {
    return {
      order_id: 0,
      previous_status: "unknown",
      new_status: "unknown",
      payment_status: data.Data.Invoice.Status,
      synced: false,
      message: `Could not extract order ID from reference: ${customerReference}`,
    };
  }

  const orderId = parseInt(orderIdMatch[1], 10);
  return await updateOrderFromPayment(orderId, data.Data);
}

async function syncByOrderId(orderId: number, apiKey: string): Promise<SyncResult> {
  const orderUrl = `${WC_API_BASE}/orders/${orderId}?${getBasicAuthParams()}`;
  
  const orderResponse = await fetch(orderUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!orderResponse.ok) {
    return {
      order_id: orderId,
      previous_status: "unknown",
      new_status: "unknown",
      payment_status: "error",
      synced: false,
      message: "Order not found in WooCommerce",
    };
  }

  const order: WooCommerceOrder = await orderResponse.json();

  if (order.status !== "pending") {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: "skipped",
      synced: false,
      message: `Order status is already '${order.status}', skipping`,
    };
  }

  const customerReference = `WC-${orderId}`;
  const searchUrl = `${getMyFatoorahApiBaseUrl()}/v2/GetPaymentStatus`;
  
  const searchResponse = await fetch(searchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      Key: customerReference,
      KeyType: "CustomerReference",
    }),
  });

  const searchData = await searchResponse.json();

  if (!searchResponse.ok || !searchData.IsSuccess) {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: "not_found",
      synced: false,
      message: "No payment found in MyFatoorah for this order",
    };
  }

  const invoiceStatus = searchData.Data?.InvoiceStatus;
  const transactions = searchData.Data?.InvoiceTransactions || [];
  const successfulTransaction = transactions.find((t: { TransactionStatus: string }) => 
    t.TransactionStatus === "Succss" || t.TransactionStatus === "Success"
  );

  if (invoiceStatus === "Paid" && successfulTransaction) {
    const updateUrl = `${WC_API_BASE}/orders/${orderId}?${getBasicAuthParams()}`;
    
    const updateData: Record<string, unknown> = {
      status: "processing",
      set_paid: true,
      transaction_id: successfulTransaction.TransactionId || successfulTransaction.PaymentId,
    };

    const metaData = [];
    
    if (successfulTransaction.PaymentGateway) {
      metaData.push({ key: "_myfatoorah_payment_method", value: successfulTransaction.PaymentGateway });
    }
    if (successfulTransaction.PaymentId) {
      metaData.push({ key: "_myfatoorah_payment_id", value: successfulTransaction.PaymentId });
    }
    if (successfulTransaction.ReferenceId) {
      metaData.push({ key: "_myfatoorah_reference_id", value: successfulTransaction.ReferenceId });
    }
    if (successfulTransaction.CardNumber) {
      metaData.push({ key: "_myfatoorah_card_number", value: successfulTransaction.CardNumber });
    }

    if (metaData.length > 0) {
      updateData.meta_data = metaData;
    }

    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (updateResponse.ok) {
      return {
        order_id: orderId,
        previous_status: order.status,
        new_status: "processing",
        payment_status: "success",
        payment_method: successfulTransaction.PaymentGateway,
        transaction_id: successfulTransaction.TransactionId || successfulTransaction.PaymentId,
        card_brand: successfulTransaction.CardNumber,
        synced: true,
        message: "Order updated to processing",
      };
    } else {
      return {
        order_id: orderId,
        previous_status: order.status,
        new_status: order.status,
        payment_status: "success",
        synced: false,
        message: "Payment was successful but failed to update WooCommerce order",
      };
    }
  }

  return {
    order_id: orderId,
    previous_status: order.status,
    new_status: order.status,
    payment_status: invoiceStatus || "unknown",
    synced: false,
    message: `Payment status is '${invoiceStatus}', no update needed`,
  };
}

async function updateOrderFromPayment(
  orderId: number, 
  paymentData: NonNullable<MyFatoorahPaymentResponse["Data"]>
): Promise<SyncResult> {
  const orderUrl = `${WC_API_BASE}/orders/${orderId}?${getBasicAuthParams()}`;
  
  const orderResponse = await fetch(orderUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!orderResponse.ok) {
    return {
      order_id: orderId,
      previous_status: "unknown",
      new_status: "unknown",
      payment_status: paymentData.Invoice.Status,
      synced: false,
      message: "Order not found in WooCommerce",
    };
  }

  const order: WooCommerceOrder = await orderResponse.json();

  if (paymentData.Invoice.Status !== "PAID") {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: paymentData.Invoice.Status,
      synced: false,
      message: `Payment status is '${paymentData.Invoice.Status}', not updating order`,
    };
  }

  if (order.status !== "pending") {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: "PAID",
      synced: false,
      message: `Order status is already '${order.status}', skipping`,
    };
  }

  const updateData: Record<string, unknown> = {
    status: "processing",
    set_paid: true,
    transaction_id: paymentData.Transaction.Id || paymentData.Transaction.PaymentId,
  };

  const metaData = [];
  
  if (paymentData.Transaction.PaymentMethod) {
    metaData.push({ key: "_myfatoorah_payment_method", value: paymentData.Transaction.PaymentMethod });
  }
  if (paymentData.Transaction.PaymentId) {
    metaData.push({ key: "_myfatoorah_payment_id", value: paymentData.Transaction.PaymentId });
  }
  if (paymentData.Transaction.ReferenceId) {
    metaData.push({ key: "_myfatoorah_reference_id", value: paymentData.Transaction.ReferenceId });
  }
  if (paymentData.Transaction.IP?.Address) {
    metaData.push({ key: "_myfatoorah_customer_ip", value: paymentData.Transaction.IP.Address });
  }
  if (paymentData.Transaction.IP?.Country) {
    metaData.push({ key: "_myfatoorah_customer_country", value: paymentData.Transaction.IP.Country });
  }
  if (paymentData.Transaction.Card) {
    metaData.push({ key: "_myfatoorah_card_brand", value: paymentData.Transaction.Card.Brand });
    metaData.push({ key: "_myfatoorah_card_number", value: paymentData.Transaction.Card.Number });
    metaData.push({ key: "_myfatoorah_card_issuer", value: paymentData.Transaction.Card.Issuer });
  }

  if (metaData.length > 0) {
    updateData.meta_data = metaData;
  }

  const updateResponse = await fetch(orderUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (updateResponse.ok) {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: "processing",
      payment_status: "PAID",
      payment_method: paymentData.Transaction.PaymentMethod,
      transaction_id: paymentData.Transaction.Id || paymentData.Transaction.PaymentId,
      card_brand: paymentData.Transaction.Card?.Brand,
      customer_ip: paymentData.Transaction.IP?.Address,
      synced: true,
      message: "Order updated to processing with payment details",
    };
  }

  return {
    order_id: orderId,
    previous_status: order.status,
    new_status: order.status,
    payment_status: "PAID",
    synced: false,
    message: "Payment was successful but failed to update WooCommerce order",
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "pending";
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const ordersUrl = `${WC_API_BASE}/orders?status=${status}&per_page=${limit}&${getBasicAuthParams()}`;
    
    const response = await fetch(ordersUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: "fetch_error", message: "Failed to fetch orders" } },
        { status: response.status }
      );
    }

    const orders = await response.json();
    
    const pendingOrders = orders.map((order: WooCommerceOrder) => ({
      order_id: order.id,
      status: order.status,
      payment_method: order.payment_method,
      transaction_id: order.transaction_id,
    }));

    return NextResponse.json({
      success: true,
      count: pendingOrders.length,
      orders: pendingOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "network_error", message: error instanceof Error ? error.message : "Network error" } },
      { status: 500 }
    );
  }
}
