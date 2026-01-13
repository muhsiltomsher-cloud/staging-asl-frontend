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

interface MyFatoorahSessionDetailsResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    SessionId: string;
    SessionExpiry: string;
    OperationType: string;
    Status: string;
    Order: {
      Amount: number;
      Currency: string;
      ExternalIdentifier: string | null;
    };
    Customer: {
      Reference: string | null;
      Cards: Array<{
        Token: string;
        Brand: string;
        Number: string;
        ExpiryMonth: string;
        ExpiryYear: string;
      }> | null;
    };
    Transaction: {
      PaymentId: string;
      Status: string;
      TransactionDate: string;
      PaymentMethod: string;
      Amount: number;
      Currency: string;
      Error: {
        Code: string;
        Message: string;
      } | null;
    } | null;
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
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_params",
            message: "Missing required parameter: sessionId",
          },
        },
        { status: 400 }
      );
    }

    console.log("MyFatoorah get-session request:", { sessionId });

    const url = `${getMyFatoorahApiBaseUrl()}/v3/sessions/${sessionId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const data: MyFatoorahSessionDetailsResponse = await response.json();

    console.log("MyFatoorah get-session response:", {
      isSuccess: data.IsSuccess,
      sessionId: data.Data?.SessionId,
      status: data.Data?.Status,
      transactionStatus: data.Data?.Transaction?.Status,
      message: data.Message,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to get session details",
          },
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id: data.Data?.SessionId,
      session_expiry: data.Data?.SessionExpiry,
      status: data.Data?.Status,
      operation_type: data.Data?.OperationType,
      order: {
        amount: data.Data?.Order?.Amount,
        currency: data.Data?.Order?.Currency,
        external_identifier: data.Data?.Order?.ExternalIdentifier,
      },
      customer: {
        reference: data.Data?.Customer?.Reference,
        cards: data.Data?.Customer?.Cards?.map(card => ({
          token: card.Token,
          brand: card.Brand,
          number: card.Number,
          expiry_month: card.ExpiryMonth,
          expiry_year: card.ExpiryYear,
        })) || [],
      },
      transaction: data.Data?.Transaction ? {
        payment_id: data.Data.Transaction.PaymentId,
        status: data.Data.Transaction.Status,
        transaction_date: data.Data.Transaction.TransactionDate,
        payment_method: data.Data.Transaction.PaymentMethod,
        amount: data.Data.Transaction.Amount,
        currency: data.Data.Transaction.Currency,
        error: data.Data.Transaction.Error ? {
          code: data.Data.Transaction.Error.Code,
          message: data.Data.Transaction.Error.Message,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error("MyFatoorah get-session error:", error);
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
