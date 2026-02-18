import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

interface OrderMetaItem {
  key: string;
  value: string;
}

interface WooOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing: {
    city: string;
    state: string;
    country: string;
  };
  shipping: {
    city: string;
    state: string;
    country: string;
  };
  meta_data: OrderMetaItem[];
  line_items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    total: string;
    price: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const refCode = searchParams.get("ref");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const influencersUrl = `${API_BASE}/wp-json/asl-influencer/v1/influencers`;
    const influencersResponse = await fetch(noCacheUrl(influencersUrl), {
      method: "GET",
      headers: backendHeaders(),
    });

    let influencerCodes: string[] = [];
    if (influencersResponse.ok) {
      const influencersData = await influencersResponse.json();
      if (influencersData.success && influencersData.influencers) {
        influencerCodes = influencersData.influencers.map((inf: { code: string }) => inf.code);
      }
    }

    if (refCode) {
      influencerCodes = [refCode.toLowerCase()];
    }

    if (influencerCodes.length === 0) {
      return NextResponse.json({ success: true, stats: [] });
    }

    const allOrders: WooOrder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams();
      params.set("per_page", "100");
      params.set("page", String(page));
      params.set("status", "processing,completed,on-hold");

      if (dateFrom) params.set("after", dateFrom + "T00:00:00");
      if (dateTo) params.set("before", dateTo + "T23:59:59");

      const ordersUrl = `${API_BASE}/wp-json/wc/v3/orders?${params.toString()}&${getBasicAuthParams()}`;
      const ordersResponse = await fetch(noCacheUrl(ordersUrl), {
        method: "GET",
        headers: backendHeaders(),
      });

      if (!ordersResponse.ok) break;

      const orders: WooOrder[] = await ordersResponse.json();
      if (orders.length === 0) {
        hasMore = false;
      } else {
        allOrders.push(...orders);
        page++;
        if (orders.length < 100) hasMore = false;
      }
    }

    const statsByCode: Record<string, {
      orders: number;
      revenue: number;
      free_gifts: number;
      cities: Record<string, number>;
      countries: Record<string, number>;
      currencies: Record<string, number>;
    }> = {};

    for (const code of influencerCodes) {
      statsByCode[code] = {
        orders: 0,
        revenue: 0,
        free_gifts: 0,
        cities: {},
        countries: {},
        currencies: {},
      };
    }

    for (const order of allOrders) {
      const refMeta = order.meta_data?.find((m) => m.key === "_influencer_ref");
      if (!refMeta) continue;

      const code = String(refMeta.value).toLowerCase();
      if (!statsByCode[code]) continue;

      const stats = statsByCode[code];
      stats.orders++;
      stats.revenue += parseFloat(order.total) || 0;

      const city = order.shipping?.city || order.billing?.city || "";
      const country = order.shipping?.country || order.billing?.country || "";

      if (city) {
        stats.cities[city] = (stats.cities[city] || 0) + 1;
      }
      if (country) {
        stats.countries[country] = (stats.countries[country] || 0) + 1;
      }

      const curr = order.currency || "AED";
      stats.currencies[curr] = (stats.currencies[curr] || 0) + 1;

      for (const item of order.line_items) {
        if (item.price === 0) {
          stats.free_gifts++;
        }
      }
    }

    const result = influencerCodes.map((code) => {
      const s = statsByCode[code];
      const sortedCities = Object.entries(s.cities).sort(([, a], [, b]) => b - a);
      const sortedCountries = Object.entries(s.countries).sort(([, a], [, b]) => b - a);

      return {
        code,
        orders: s.orders,
        revenue: Math.round(s.revenue * 100) / 100,
        free_gifts: s.free_gifts,
        top_cities: Object.fromEntries(sortedCities.slice(0, 5)),
        top_countries: Object.fromEntries(sortedCountries.slice(0, 5)),
        currencies: s.currencies,
      };
    });

    return NextResponse.json({ success: true, stats: result });
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
