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

function getMyFatoorahSessionScriptUrl(): string {
  if (getEnvVar("MYFATOORAH_TEST_MODE") === "true") {
    return "https://demo.myfatoorah.com/sessions/v1/session.js";
  }
  
  const country = (getEnvVar("MYFATOORAH_COUNTRY") || "KWT").toUpperCase();
  
  switch (country) {
    case "AE":
    case "UAE":
      return "https://ae.myfatoorah.com/sessions/v1/session.js";
    case "SA":
    case "SAU":
      return "https://sa.myfatoorah.com/sessions/v1/session.js";
    case "QA":
    case "QAT":
      return "https://qa.myfatoorah.com/sessions/v1/session.js";
    case "EG":
    case "EGY":
      return "https://eg.myfatoorah.com/sessions/v1/session.js";
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
      return "https://portal.myfatoorah.com/sessions/v1/session.js";
  }
}

interface CreateSessionRequest {
  order_id: number;
  order_key: string;
  amount: number;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_reference?: string;
  language?: string;
  callback_url: string;
  error_url: string;
}

interface MyFatoorahSessionResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    SessionId: string;
    SessionExpiry: string;
    EncryptionKey: string;
    OperationType: string;
    Order: {
      Amount: number;
      Currency: string;
      ExternalIdentifier: string | null;
    };
    Customer: {
      Reference: string | null;
      Cards: unknown[] | null;
    };
  } | null;
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

    const body: CreateSessionRequest = await request.json();
    
    console.log("MyFatoorah create-session request:", JSON.stringify({
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
    }));
    
    const {
      order_id,
      order_key,
      amount,
      currency = "KWD",
      customer_name,
      customer_email,
      customer_phone,
      customer_reference,
      language = "en",
      callback_url,
      error_url,
    } = body;

    if (!order_id || !amount || !callback_url || !error_url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_params",
            message: "Missing required parameters: order_id, amount, callback_url, error_url",
          },
        },
        { status: 400 }
      );
    }

    const sessionData: Record<string, unknown> = {
      PaymentMode: "COMPLETE_PAYMENT",
      Order: {
        Amount: Number(amount),
        Currency: currency,
        ExternalIdentifier: `WC-${order_id}`,
      },
      IntegrationUrls: {
        Redirection: `${callback_url}?order_id=${order_id}&order_key=${order_key}`,
        Error: `${error_url}?order_id=${order_id}&order_key=${order_key}`,
      },
      Language: language.toUpperCase() as "EN" | "AR",
    };

    if (customer_name || customer_email || customer_phone || customer_reference) {
      sessionData.Customer = {
        ...(customer_name && { Name: customer_name }),
        ...(customer_email && { Email: customer_email }),
        ...(customer_phone && { Mobile: customer_phone }),
        Reference: customer_reference || `WC-${order_id}`,
      };
    }

    const url = `${getMyFatoorahApiBaseUrl()}/v3/sessions`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(sessionData),
    });

    const data: MyFatoorahSessionResponse = await response.json();

    console.log("MyFatoorah create-session response:", JSON.stringify({
      isSuccess: data.IsSuccess,
      sessionId: data.Data?.SessionId,
      message: data.Message,
      validationErrors: data.ValidationErrors,
    }));

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to create session",
          },
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id: data.Data?.SessionId,
      session_expiry: data.Data?.SessionExpiry,
      encryption_key: data.Data?.EncryptionKey,
      script_url: getMyFatoorahSessionScriptUrl(),
      order: {
        amount: data.Data?.Order?.Amount,
        currency: data.Data?.Order?.Currency,
      },
    });
  } catch (error) {
    console.error("MyFatoorah create-session error:", error);
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
