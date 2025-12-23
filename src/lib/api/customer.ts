import { siteConfig } from "@/config/site";
import { getAuthToken } from "./auth";

const API_BASE = `${siteConfig.apiUrl}/wp-json/wc/v3`;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";

export interface CustomerAddress {
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

export interface Customer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: CustomerAddress;
  shipping: CustomerAddress;
  is_paying_customer: boolean;
  avatar_url: string;
}

export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: Array<{ id: number; total: string; subtotal: string }>;
  meta_data: Array<{ id: number; key: string; value: string }>;
  sku: string;
  price: number;
  image: {
    id: number;
    src: string;
  };
}

export interface Order {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: CustomerAddress;
  shipping: CustomerAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: Array<{ id: number; key: string; value: string }>;
  line_items: OrderLineItem[];
  tax_lines: Array<{
    id: number;
    rate_code: string;
    rate_id: number;
    label: string;
    compound: boolean;
    tax_total: string;
    shipping_tax_total: string;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
  }>;
  fee_lines: Array<{
    id: number;
    name: string;
    tax_class: string;
    tax_status: string;
    amount: string;
    total: string;
    total_tax: string;
  }>;
  coupon_lines: Array<{
    id: number;
    code: string;
    discount: string;
    discount_tax: string;
  }>;
  refunds: Array<{
    id: number;
    reason: string;
    total: string;
  }>;
  currency_symbol: string;
}

export interface CustomerError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export interface CustomerOperationResponse<T> {
  success: boolean;
  data?: T;
  error?: CustomerError;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

function getBasicAuthParams(): string {
  return `consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
}

export async function getCustomer(
  customerId: number
): Promise<CustomerOperationResponse<Customer>> {
  try {
    const response = await fetch(
      `${API_BASE}/customers/${customerId}?${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "customer_error",
          message: data.message || "Failed to get customer.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function updateCustomer(
  customerId: number,
  customerData: Partial<Customer>
): Promise<CustomerOperationResponse<Customer>> {
  try {
    const response = await fetch(
      `${API_BASE}/customers/${customerId}?${getBasicAuthParams()}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "customer_update_error",
          message: data.message || "Failed to update customer.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function getCustomerOrders(
  customerId: number,
  params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }
): Promise<CustomerOperationResponse<Order[]>> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("customer", customerId.toString());

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page)
      searchParams.set("per_page", params.per_page.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetch(
      `${API_BASE}/orders?${searchParams.toString()}&${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "orders_error",
          message: data.message || "Failed to get orders.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function getOrder(
  orderId: number
): Promise<CustomerOperationResponse<Order>> {
  try {
    const response = await fetch(
      `${API_BASE}/orders/${orderId}?${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "order_error",
          message: data.message || "Failed to get order.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function updateCustomerAddress(
  customerId: number,
  addressType: "billing" | "shipping",
  address: CustomerAddress
): Promise<CustomerOperationResponse<Customer>> {
  try {
    const response = await fetch(
      `${API_BASE}/customers/${customerId}?${getBasicAuthParams()}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ [addressType]: address }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "address_update_error",
          message: data.message || "Failed to update address.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending Payment",
    processing: "Processing",
    "on-hold": "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    failed: "Failed",
  };

  return statusMap[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    "on-hold": "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-purple-100 text-purple-800",
    failed: "bg-red-100 text-red-800",
  };

  return colorMap[status] || "bg-gray-100 text-gray-800";
}

export function formatPrice(
  price: string | number,
  currencySymbol: string = "SAR"
): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `${currencySymbol} ${numPrice.toFixed(2)}`;
}

export function formatDate(dateString: string, locale: string = "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
