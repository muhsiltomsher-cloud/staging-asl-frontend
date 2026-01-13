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

interface MyFatoorahPaymentDetailsResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    PaymentId: string;
    Status: string;
    PaymentMethod: string;
    Amount: number;
    Currency: string;
    TransactionDate: string;
    Order: {
      Amount: number;
      Currency: string;
      ExternalIdentifier: string | null;
    };
    Customer: {
      Name: string;
      Email: string;
      Mobile: string;
      Reference: string | null;
    };
    Card: {
      Brand: string;
      Number: string;
      ExpiryMonth: string;
      ExpiryYear: string;
      Token: string | null;
    } | null;
    Error: {
      Code: string;
      Message: string;
    } | null;
    AuthorizationId: string | null;
    ReferenceId: string | null;
    TrackId: string | null;
  } | null;
}

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

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_params",
            message: "Missing required parameter: paymentId",
          },
        },
        { status: 400 }
      );
    }

    console.log("MyFatoorah get-payment request:", { paymentId });

    const url = `${getMyFatoorahApiBaseUrl()}/v3/payments/${paymentId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const data: MyFatoorahPaymentDetailsResponse = await response.json();

    console.log("MyFatoorah get-payment response:", {
      isSuccess: data.IsSuccess,
      paymentId: data.Data?.PaymentId,
      status: data.Data?.Status,
      message: data.Message,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to get payment details",
          },
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: data.Data?.PaymentId,
      status: data.Data?.Status,
      payment_method: data.Data?.PaymentMethod,
      amount: data.Data?.Amount,
      currency: data.Data?.Currency,
      transaction_date: data.Data?.TransactionDate,
      order: {
        amount: data.Data?.Order?.Amount,
        currency: data.Data?.Order?.Currency,
        external_identifier: data.Data?.Order?.ExternalIdentifier,
      },
      customer: {
        name: data.Data?.Customer?.Name,
        email: data.Data?.Customer?.Email,
        mobile: data.Data?.Customer?.Mobile,
        reference: data.Data?.Customer?.Reference,
      },
      card: data.Data?.Card ? {
        brand: data.Data.Card.Brand,
        number: data.Data.Card.Number,
        expiry_month: data.Data.Card.ExpiryMonth,
        expiry_year: data.Data.Card.ExpiryYear,
        token: data.Data.Card.Token,
      } : null,
      error: data.Data?.Error ? {
        code: data.Data.Error.Code,
        message: data.Data.Error.Message,
      } : null,
      authorization_id: data.Data?.AuthorizationId,
      reference_id: data.Data?.ReferenceId,
      track_id: data.Data?.TrackId,
    });
  } catch (error) {
    console.error("MyFatoorah get-payment error:", error);
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
