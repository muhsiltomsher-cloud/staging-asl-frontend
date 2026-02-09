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

interface MyFatoorahTransaction {
  TransactionDate: string;
  PaymentGateway: string;
  ReferenceId: string;
  TrackId: string;
  TransactionId: string;
  PaymentId: string;
  AuthorizationId: string;
  TransactionStatus: string;
  TransactionValue: string;
  CustomerServiceCharge: string;
  DueValue: string;
  PaidCurrency: string;
  PaidCurrencyValue: string;
  IpAddress: string;
  Country: string;
  Currency: string;
  Error: string | null;
  ErrorCode: string;
  CardNumber: string;
  CardBrand: string;
  CardIssuer: string;
  CardIssuingCountry: string;
  CardFundingMethod: string;
}

interface MyFatoorahPaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    InvoiceId: number;
    InvoiceStatus: "Paid" | "Unpaid" | "Expired" | "Pending";
    InvoiceReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    UserDefinedField: string;
    InvoiceDisplayValue: string;
    InvoiceTransactions: MyFatoorahTransaction[];
  } | null;
}

interface WooCommerceOrderAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface WooCommerceOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  price: number;
  sku: string;
  image: {
    id: number;
    src: string;
  };
}

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  currency_symbol: string;
  date_created: string;
  date_modified: string;
  date_paid: string | null;
  total: string;
  subtotal: string;
  shipping_total: string;
  discount_total: string;
  total_tax: string;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_id: number;
  customer_note: string;
  billing: WooCommerceOrderAddress;
  shipping: WooCommerceOrderAddress;
  line_items: WooCommerceOrderLineItem[];
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
  const url = `${getMyFatoorahApiBaseUrl()}/v2/GetPaymentStatus`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      Key: paymentId,
      KeyType: "PaymentId",
    }),
  });

  const data: MyFatoorahPaymentStatusResponse = await response.json();

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

  const customerReference = data.Data.UserDefinedField;
  const orderIdMatch = customerReference?.match(/WC-(\d+)/);
  
  if (!orderIdMatch) {
    return {
      order_id: 0,
      previous_status: "unknown",
      new_status: "unknown",
      payment_status: data.Data.InvoiceStatus,
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
    
    // Invoice details
    if (searchData.Data?.InvoiceId) {
      metaData.push({ key: "_myfatoorah_invoice_id", value: String(searchData.Data.InvoiceId) });
    }
    metaData.push({ key: "_myfatoorah_invoice_status", value: invoiceStatus });
    // Transaction details
    if (successfulTransaction.TransactionId) {
      metaData.push({ key: "_myfatoorah_transaction_id", value: successfulTransaction.TransactionId });
    }
    metaData.push({ key: "_myfatoorah_transaction_status", value: successfulTransaction.TransactionStatus || "Success" });
    // Payment details
    if (successfulTransaction.PaymentGateway) {
      metaData.push({ key: "_myfatoorah_payment_method", value: successfulTransaction.PaymentGateway });
    }
    if (successfulTransaction.PaymentId) {
      metaData.push({ key: "_myfatoorah_payment_id", value: successfulTransaction.PaymentId });
    }
    if (successfulTransaction.ReferenceId) {
      metaData.push({ key: "_myfatoorah_reference_id", value: successfulTransaction.ReferenceId });
    }
    if (successfulTransaction.TrackId) {
      metaData.push({ key: "_myfatoorah_track_id", value: successfulTransaction.TrackId });
    }
    if (successfulTransaction.TransactionDate) {
      metaData.push({ key: "_myfatoorah_transaction_date", value: successfulTransaction.TransactionDate });
    }
    // Card details
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
  paymentData: NonNullable<MyFatoorahPaymentStatusResponse["Data"]>
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
      payment_status: paymentData.InvoiceStatus,
      synced: false,
      message: "Order not found in WooCommerce",
    };
  }

  const order: WooCommerceOrder = await orderResponse.json();

  const transactions = paymentData.InvoiceTransactions || [];
  const successfulTransaction = transactions.find(
    (t) => t.TransactionStatus === "Succss" || t.TransactionStatus === "Success" || t.TransactionStatus === "SUCCESS"
  );

  if (paymentData.InvoiceStatus !== "Paid" || !successfulTransaction) {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: paymentData.InvoiceStatus,
      synced: false,
      message: `Payment status is '${paymentData.InvoiceStatus}', not updating order`,
    };
  }

  if (order.status !== "pending") {
    return {
      order_id: orderId,
      previous_status: order.status,
      new_status: order.status,
      payment_status: "Paid",
      synced: false,
      message: `Order status is already '${order.status}', skipping`,
    };
  }

  const updateData: Record<string, unknown> = {
    status: "processing",
    set_paid: true,
    transaction_id: successfulTransaction.TransactionId || successfulTransaction.PaymentId,
  };

  const metaData = [];
  
  if (paymentData.InvoiceId) {
    metaData.push({ key: "_myfatoorah_invoice_id", value: String(paymentData.InvoiceId) });
  }
  metaData.push({ key: "_myfatoorah_invoice_status", value: paymentData.InvoiceStatus });
  if (successfulTransaction.TransactionId) {
    metaData.push({ key: "_myfatoorah_transaction_id", value: successfulTransaction.TransactionId });
  }
  metaData.push({ key: "_myfatoorah_transaction_status", value: successfulTransaction.TransactionStatus || "Success" });
  if (successfulTransaction.PaymentGateway) {
    metaData.push({ key: "_myfatoorah_payment_method", value: successfulTransaction.PaymentGateway });
  }
  if (successfulTransaction.PaymentId) {
    metaData.push({ key: "_myfatoorah_payment_id", value: successfulTransaction.PaymentId });
  }
  if (successfulTransaction.ReferenceId) {
    metaData.push({ key: "_myfatoorah_reference_id", value: successfulTransaction.ReferenceId });
  }
  if (successfulTransaction.TrackId) {
    metaData.push({ key: "_myfatoorah_track_id", value: successfulTransaction.TrackId });
  }
  if (successfulTransaction.TransactionDate) {
    metaData.push({ key: "_myfatoorah_transaction_date", value: successfulTransaction.TransactionDate });
  }
  if (successfulTransaction.IpAddress) {
    metaData.push({ key: "_myfatoorah_customer_ip", value: successfulTransaction.IpAddress });
  }
  if (successfulTransaction.Country) {
    metaData.push({ key: "_myfatoorah_customer_country", value: successfulTransaction.Country });
  }
  if (successfulTransaction.CardBrand) {
    metaData.push({ key: "_myfatoorah_card_brand", value: successfulTransaction.CardBrand });
  }
  if (successfulTransaction.CardNumber) {
    metaData.push({ key: "_myfatoorah_card_number", value: successfulTransaction.CardNumber });
  }
  if (successfulTransaction.CardIssuer) {
    metaData.push({ key: "_myfatoorah_card_issuer", value: successfulTransaction.CardIssuer });
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
      payment_status: "Paid",
      payment_method: successfulTransaction.PaymentGateway,
      transaction_id: successfulTransaction.TransactionId || successfulTransaction.PaymentId,
      card_brand: successfulTransaction.CardBrand,
      customer_ip: successfulTransaction.IpAddress,
      synced: true,
      message: "Order updated to processing with payment details",
    };
  }

  return {
    order_id: orderId,
    previous_status: order.status,
    new_status: order.status,
    payment_status: "Paid",
    synced: false,
    message: "Payment was successful but failed to update WooCommerce order",
  };
}

function extractPaymentDetails(metaData: Array<{ key: string; value: string }>) {
  const paymentDetails: Record<string, string> = {};
  
  const paymentMetaKeys = [
    "_myfatoorah_invoice_id",
    "_myfatoorah_invoice_status",
    "_myfatoorah_transaction_id",
    "_myfatoorah_transaction_status",
    "_myfatoorah_payment_id",
    "_myfatoorah_payment_method",
    "_myfatoorah_reference_id",
    "_myfatoorah_track_id",
    "_myfatoorah_authorization_id",
    "_myfatoorah_transaction_date",
    "_myfatoorah_customer_ip",
    "_myfatoorah_customer_country",
    "_myfatoorah_card_brand",
    "_myfatoorah_card_number",
    "_myfatoorah_card_issuer",
    "_myfatoorah_card_issuer_country",
    "_myfatoorah_card_funding_method",
    "_myfatoorah_error_code",
    "_myfatoorah_error_message",
  ];
  
  for (const meta of metaData) {
    if (paymentMetaKeys.includes(meta.key)) {
      const cleanKey = meta.key.replace(/^_myfatoorah_|^_/, "");
      paymentDetails[cleanKey] = meta.value;
    }
  }
  
  return Object.keys(paymentDetails).length > 0 ? paymentDetails : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "pending";
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const includeDetails = searchParams.get("include_details") === "true";

  try {
    const ordersUrl = `${WC_API_BASE}/orders?status=${status}&per_page=${limit}&orderby=date&order=desc&${getBasicAuthParams()}`;
    
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

    const orders: WooCommerceOrder[] = await response.json();
    
    if (includeDetails) {
      const detailedOrders = orders.map((order) => {
        const paymentDetails = extractPaymentDetails(order.meta_data);
        
        return {
          order_id: order.id,
          order_number: order.number,
          status: order.status,
          currency: order.currency,
          currency_symbol: order.currency_symbol,
          date_created: order.date_created,
          date_modified: order.date_modified,
          date_paid: order.date_paid,
          total: order.total,
          subtotal: order.subtotal,
          shipping_total: order.shipping_total,
          discount_total: order.discount_total,
          total_tax: order.total_tax,
          payment_method: order.payment_method,
          payment_method_title: order.payment_method_title,
          transaction_id: order.transaction_id,
          customer_id: order.customer_id,
          customer_note: order.customer_note,
          billing: {
            first_name: order.billing.first_name,
            last_name: order.billing.last_name,
            company: order.billing.company,
            address_1: order.billing.address_1,
            address_2: order.billing.address_2,
            city: order.billing.city,
            state: order.billing.state,
            postcode: order.billing.postcode,
            country: order.billing.country,
            email: order.billing.email,
            phone: order.billing.phone,
          },
          shipping: {
            first_name: order.shipping.first_name,
            last_name: order.shipping.last_name,
            company: order.shipping.company,
            address_1: order.shipping.address_1,
            address_2: order.shipping.address_2,
            city: order.shipping.city,
            state: order.shipping.state,
            postcode: order.shipping.postcode,
            country: order.shipping.country,
            phone: order.shipping.phone,
          },
          line_items: order.line_items.map((item) => ({
            id: item.id,
            name: item.name,
            product_id: item.product_id,
            variation_id: item.variation_id,
            quantity: item.quantity,
            subtotal: item.subtotal,
            total: item.total,
            price: item.price,
            sku: item.sku,
            image: item.image,
          })),
          payment_details: paymentDetails,
        };
      });

      return NextResponse.json({
        success: true,
        count: detailedOrders.length,
        orders: detailedOrders,
      });
    }
    
    const basicOrders = orders.map((order) => ({
      order_id: order.id,
      order_number: order.number,
      status: order.status,
      payment_method: order.payment_method,
      transaction_id: order.transaction_id,
      date_created: order.date_created,
      total: order.total,
      currency: order.currency,
    }));

    return NextResponse.json({
      success: true,
      count: basicOrders.length,
      orders: basicOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "network_error", message: error instanceof Error ? error.message : "Network error" } },
      { status: 500 }
    );
  }
}
