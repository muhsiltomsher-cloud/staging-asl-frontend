import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";

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

    const paymentData = {
      NotificationOption: "LNK",
      InvoiceValue: invoice_value,
      CustomerName: customer_name,
      CustomerEmail: customer_email || "",
      CustomerMobile: customer_phone || "",
      DisplayCurrencyIso: currency_iso,
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
