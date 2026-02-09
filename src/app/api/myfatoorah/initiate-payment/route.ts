import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { siteConfig } from "@/config/site";

function normalizePhoneForMyFatoorah(phone: string | undefined): string {
  if (!phone) return "";
  
  let normalized = phone.replace(/[\s\-\(\)]/g, "");
  
  if (normalized.startsWith("+")) {
    normalized = normalized.substring(1);
  }
  
  const countryCodePrefixes = [
    "971", "966", "965", "973", "968", "974", "962", "20",
    "00971", "00966", "00965", "00973", "00968", "00974", "00962", "0020"
  ];
  
  for (const prefix of countryCodePrefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length);
      break;
    }
  }
  
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1);
  }
  
  return normalized.substring(0, 11);
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

function getMyFatoorahBaseCurrency(): string {
  const country = (getEnvVar("MYFATOORAH_COUNTRY") || "KWT").toUpperCase();
  switch (country) {
    case "AE": case "UAE": return "AED";
    case "SA": case "SAU": return "SAR";
    case "QA": case "QAT": return "QAR";
    case "EG": case "EGY": return "EGP";
    case "BH": case "BHR": return "BHD";
    case "JO": case "JOR": return "JOD";
    case "OM": case "OMN": return "OMR";
    case "KW": case "KWT":
    case "PORTAL": case "MAIN":
    default: return "KWD";
  }
}

const DEFAULT_CURRENCY_RATES: Record<string, number> = {
  AED: 1, BHD: 0.103, KWD: 0.083, OMR: 0.105,
  QAR: 0.99, SAR: 1.02, USD: 0.27, EGP: 8.41, JOD: 0.193,
};

async function getCurrencyRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `${siteConfig.apiUrl}/wp-json/asl/v1/currencies`,
      { next: { revalidate: 60 } }
    );
    if (response.ok) {
      const currencies = await response.json();
      if (Array.isArray(currencies) && currencies.length > 0) {
        const rates: Record<string, number> = {};
        for (const c of currencies) {
          rates[c.code] = c.rateFromAED;
        }
        return rates;
      }
    }
  } catch (error) {
    console.error("Failed to fetch currency rates for MyFatoorah conversion:", error);
  }
  return DEFAULT_CURRENCY_RATES;
}

function convertToBaseCurrency(
  amount: number,
  fromCurrency: string,
  baseCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === baseCurrency) return amount;
  const fromRate = rates[fromCurrency];
  const toRate = rates[baseCurrency];
  if (!fromRate || !toRate) return amount;
  const amountInAED = amount / fromRate;
  const converted = amountInAED * toRate;
  const decimals = ["KWD", "BHD", "OMR", "JOD"].includes(baseCurrency) ? 3 : 2;
  return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

interface InitiatePaymentRequest {
  order_id: number;
  order_key: string;
  invoice_value: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  currency_iso?: string;
  language?: string;
  callback_url: string;
  error_url: string;
}

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

    const body: InitiatePaymentRequest = await request.json();
    
    console.log("MyFatoorah initiate-payment request:", {
      order_id: body.order_id,
      invoice_value: body.invoice_value,
      currency_iso: body.currency_iso,
    });
    
    const {
      order_id,
      order_key,
      invoice_value,
      customer_name,
      customer_email,
      customer_phone,
      currency_iso = "KWD",
      language = "en",
      callback_url,
      error_url,
    } = body;

    if (!order_id || !invoice_value || !customer_name || !callback_url || !error_url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_params",
            message: "Missing required parameters: order_id, invoice_value, customer_name, callback_url, error_url",
          },
        },
        { status: 400 }
      );
    }

    const baseCurrency = getMyFatoorahBaseCurrency();
    let finalInvoiceValue = invoice_value;

    if (currency_iso !== baseCurrency) {
      const rates = await getCurrencyRates();
      finalInvoiceValue = convertToBaseCurrency(invoice_value, currency_iso, baseCurrency, rates);
      console.log(`MyFatoorah currency conversion: ${invoice_value} ${currency_iso} → ${finalInvoiceValue} ${baseCurrency}`);
    }

    const paymentData = {
      NotificationOption: "LNK",
      InvoiceValue: finalInvoiceValue,
      CustomerName: customer_name,
      CustomerEmail: customer_email || "",
      CustomerMobile: normalizePhoneForMyFatoorah(customer_phone),
      CallBackUrl: `${callback_url}?order_id=${order_id}&order_key=${order_key}`,
      ErrorUrl: `${error_url}?order_id=${order_id}&order_key=${order_key}`,
      Language: language,
      CustomerReference: `WC-${order_id}`,
      UserDefinedField: order_key,
    };

    const response = await fetch(`${getMyFatoorahApiBaseUrl()}/v2/SendPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to initiate payment",
          },
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_url: data.Data?.InvoiceURL,
      invoice_id: data.Data?.InvoiceId,
    });
  } catch (error) {
    console.error("MyFatoorah initiate-payment error:", error);
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
