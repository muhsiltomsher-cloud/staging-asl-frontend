import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/security";
import { API_BASE as BASE_URL, backendHeaders, backendPostHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

const API_BASE = `${BASE_URL}/wp-json/wc/v3`;

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

interface OrderLineItemMeta {
  key: string;
  value: string;
}

interface OrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
  subtotal?: string;
  total?: string;
  meta_data?: OrderLineItemMeta[];
}

interface OrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  state?: string;
  postcode?: string;
  country: string;
  email?: string;
  phone?: string;
}

interface CouponLine {
  code: string;
}

interface FeeLine {
  name: string;
  total: string;
  tax_status?: string;
  tax_class?: string;
}

interface ShippingLine {
  method_id: string;
  method_title: string;
  total: string;
}

interface CreateOrderRequest {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  currency?: string;
  billing: OrderAddress;
  shipping: OrderAddress;
  line_items: OrderLineItem[];
  shipping_lines?: ShippingLine[];
  coupon_lines?: CouponLine[];
  fee_lines?: FeeLine[];
  customer_note?: string;
  customer_id?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const orderKey = searchParams.get("order_key");
  const customerId = searchParams.get("customerId");
  const page = searchParams.get("page");
  const perPage = searchParams.get("per_page");
  const status = searchParams.get("status");

  try {
    let url: string;
    
    if (orderId) {
      // First fetch the order
      const orderUrl = `${API_BASE}/orders/${orderId}?${getBasicAuthParams()}`;
      const orderResponse = await fetch(noCacheUrl(orderUrl), {
        method: "GET",
        headers: backendHeaders(),
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        return NextResponse.json(
          {
            success: false,
            error: {
              code: errorData.code || "orders_error",
              message: errorData.message || "Failed to get order.",
            },
          },
          { status: orderResponse.status }
        );
      }
      
      const orderData = await orderResponse.json();
      
      // Security check: Either order_key must match OR user must be authenticated and own the order
      if (orderKey) {
        // Guest checkout flow: Verify order_key matches (WooCommerce standard pattern)
        // The order_key is a secret token that proves legitimate access to the order
        if (orderData.order_key !== orderKey) {
          return forbiddenResponse("Invalid order key");
        }
      } else {
        // Authenticated user flow: Verify user owns this order
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.user) {
          return unauthorizedResponse(authResult.error);
        }
        
        if (orderData.customer_id !== authResult.user.user_id) {
          return forbiddenResponse("You do not have permission to view this order");
        }
      }
      
      return NextResponse.json({ success: true, data: orderData });
    } else if (customerId) {
      // For listing orders by customer, always require authentication
      const authResult = await verifyAuth(request);
      if (!authResult.authenticated || !authResult.user) {
        return unauthorizedResponse(authResult.error);
      }
      
      // Verify the authenticated user is requesting their own orders
      if (parseInt(customerId) !== authResult.user.user_id) {
        return forbiddenResponse("You can only view your own orders");
      }
      
      const params = new URLSearchParams();
      params.set("customer", customerId);
      if (page) params.set("page", page);
      if (perPage) params.set("per_page", perPage);
      if (status) params.set("status", status);
      url = `${API_BASE}/orders?${params.toString()}&${getBasicAuthParams()}`;
    } else {
      return NextResponse.json(
        { success: false, error: { code: "missing_params", message: "Order ID or Customer ID is required" } },
        { status: 400 }
      );
    }

    const response = await fetch(noCacheUrl(url), {
      method: "GET",
      headers: backendHeaders(),
    });

    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_response",
            message: "Backend returned non-JSON response. If using LiteSpeed Cache, exclude /wp-json/* paths from caching.",
          },
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "orders_error",
            message: data.message || "Failed to get orders.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const orderData: CreateOrderRequest = {
      payment_method: body.payment_method || "myfatoorah_v2",
      payment_method_title: "Credit/Debit Card",
      set_paid: false,
      ...(body.currency ? { currency: body.currency } : {}),
      billing: {
        first_name: body.billing.first_name,
        last_name: body.billing.last_name,
        address_1: body.billing.address_1,
        city: body.billing.city,
        state: body.billing.state || "",
        postcode: body.billing.postcode || "",
        country: body.billing.country,
        email: body.billing.email,
        phone: body.billing.phone,
      },
      shipping: {
        first_name: body.shipping?.first_name || body.billing.first_name,
        last_name: body.shipping?.last_name || body.billing.last_name,
        address_1: body.shipping?.address_1 || body.billing.address_1,
        city: body.shipping?.city || body.billing.city,
        state: body.shipping?.state || body.billing.state || "",
        postcode: body.shipping?.postcode || body.billing.postcode || "",
        country: body.shipping?.country || body.billing.country,
      },
      line_items: body.line_items,
      customer_note: body.customer_note || "",
    };

    if (body.shipping_lines && body.shipping_lines.length > 0) {
      orderData.shipping_lines = body.shipping_lines;
    }

    if (body.coupon_lines && body.coupon_lines.length > 0) {
      orderData.coupon_lines = body.coupon_lines;
    }

    if (body.fee_lines && body.fee_lines.length > 0) {
      orderData.fee_lines = body.fee_lines;
    }

    if (body.customer_id) {
      orderData.customer_id = body.customer_id;
    }

    const url = `${API_BASE}/orders?${getBasicAuthParams()}`;
    
    const response = await fetch(noCacheUrl(url), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "order_creation_error",
            message: data.message || "Failed to create order.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order: data,
      order_id: data.id,
      order_key: data.order_key,
      payment_url: data.payment_url || null,
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

interface PaymentMetaData {
  // Invoice details
  invoice_id?: string;
  invoice_status?: string;
  // Transaction details
  transaction_id?: string;
  transaction_status?: string;
  // Payment details
  payment_id?: string;
  payment_method?: string;
  reference_id?: string;
  track_id?: string;
  authorization_id?: string;
  transaction_date?: string;
  // Customer details
  customer_ip?: string;
  customer_country?: string;
  // Card details
  card_brand?: string;
  card_number?: string;
  card_issuer?: string;
  card_issuer_country?: string;
  card_funding_method?: string;
  // Paid currency details (actual gateway currency)
  paid_currency?: string;
  paid_currency_value?: string;
  // Error details
  error_code?: string;
  error_message?: string;
}

interface UpdateOrderRequest {
  order_id: number;
  status?: string;
  set_paid?: boolean;
  transaction_id?: string;
  payment_method?: string;
  payment_method_title?: string;
  payment_details?: PaymentMetaData;
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateOrderRequest = await request.json();
    
    if (!body.order_id) {
      return NextResponse.json(
        { success: false, error: { code: "missing_params", message: "Order ID is required" } },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (body.status) {
      updateData.status = body.status;
    }
    
    if (body.set_paid !== undefined) {
      updateData.set_paid = body.set_paid;
    }
    
    if (body.transaction_id) {
      updateData.transaction_id = body.transaction_id;
    }
    
    if (body.payment_method) {
      updateData.payment_method = body.payment_method;
    }
    
    if (body.payment_method_title) {
      updateData.payment_method_title = body.payment_method_title;
    }

    // Add payment details as meta_data for WooCommerce
    if (body.payment_details) {
      const metaData: Array<{ key: string; value: string }> = [];
      
      // Invoice details
      if (body.payment_details.invoice_id) {
        metaData.push({ key: "_myfatoorah_invoice_id", value: body.payment_details.invoice_id });
      }
      if (body.payment_details.invoice_status) {
        metaData.push({ key: "_myfatoorah_invoice_status", value: body.payment_details.invoice_status });
      }
      // Transaction details
      if (body.payment_details.transaction_id) {
        metaData.push({ key: "_myfatoorah_transaction_id", value: body.payment_details.transaction_id });
      }
      if (body.payment_details.transaction_status) {
        metaData.push({ key: "_myfatoorah_transaction_status", value: body.payment_details.transaction_status });
      }
      // Payment details
      if (body.payment_details.payment_id) {
        metaData.push({ key: "_myfatoorah_payment_id", value: body.payment_details.payment_id });
      }
      if (body.payment_details.payment_method) {
        metaData.push({ key: "_myfatoorah_payment_method", value: body.payment_details.payment_method });
      }
      if (body.payment_details.reference_id) {
        metaData.push({ key: "_myfatoorah_reference_id", value: body.payment_details.reference_id });
      }
      if (body.payment_details.track_id) {
        metaData.push({ key: "_myfatoorah_track_id", value: body.payment_details.track_id });
      }
      if (body.payment_details.authorization_id) {
        metaData.push({ key: "_myfatoorah_authorization_id", value: body.payment_details.authorization_id });
      }
      if (body.payment_details.transaction_date) {
        metaData.push({ key: "_myfatoorah_transaction_date", value: body.payment_details.transaction_date });
      }
      // Customer details
      if (body.payment_details.customer_ip) {
        metaData.push({ key: "_myfatoorah_customer_ip", value: body.payment_details.customer_ip });
      }
      if (body.payment_details.customer_country) {
        metaData.push({ key: "_myfatoorah_customer_country", value: body.payment_details.customer_country });
      }
      // Card details
      if (body.payment_details.card_brand) {
        metaData.push({ key: "_myfatoorah_card_brand", value: body.payment_details.card_brand });
      }
      if (body.payment_details.card_number) {
        metaData.push({ key: "_myfatoorah_card_number", value: body.payment_details.card_number });
      }
      if (body.payment_details.card_issuer) {
        metaData.push({ key: "_myfatoorah_card_issuer", value: body.payment_details.card_issuer });
      }
      if (body.payment_details.card_issuer_country) {
        metaData.push({ key: "_myfatoorah_card_issuer_country", value: body.payment_details.card_issuer_country });
      }
      if (body.payment_details.card_funding_method) {
        metaData.push({ key: "_myfatoorah_card_funding_method", value: body.payment_details.card_funding_method });
      }
      // Paid currency details
      if (body.payment_details.paid_currency) {
        metaData.push({ key: "myfatoorah_paid_currency", value: body.payment_details.paid_currency });
      }
      if (body.payment_details.paid_currency_value) {
        metaData.push({ key: "myfatoorah_paid_currency_value", value: body.payment_details.paid_currency_value });
      }
      // Error details
      if (body.payment_details.error_code) {
        metaData.push({ key: "_myfatoorah_error_code", value: body.payment_details.error_code });
      }
      if (body.payment_details.error_message) {
        metaData.push({ key: "_myfatoorah_error_message", value: body.payment_details.error_message });
      }
      
      if (metaData.length > 0) {
        updateData.meta_data = metaData;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "no_updates", message: "No update fields provided" } },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/orders/${body.order_id}?${getBasicAuthParams()}`;
    
    const response = await fetch(noCacheUrl(url), {
      method: "PUT",
      headers: backendPostHeaders(),
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "order_update_error",
            message: data.message || "Failed to update order.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order: data,
      order_id: data.id,
      status: data.status,
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
