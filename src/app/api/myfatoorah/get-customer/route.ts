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

interface MyFatoorahCustomerDetailsResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    Reference: string;
    Name: string;
    Email: string;
    Mobile: string;
    Cards: Array<{
      Token: string;
      Brand: string;
      Number: string;
      ExpiryMonth: string;
      ExpiryYear: string;
      NameOnCard: string;
      Issuer: string;
      IssuerCountry: string;
      FundingMethod: string;
    }> | null;
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
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_params",
            message: "Missing required parameter: reference",
          },
        },
        { status: 400 }
      );
    }

    console.log("MyFatoorah get-customer request:", { reference });

    const url = `${getMyFatoorahApiBaseUrl()}/v3/customers/${encodeURIComponent(reference)}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const data: MyFatoorahCustomerDetailsResponse = await response.json();

    console.log("MyFatoorah get-customer response:", {
      isSuccess: data.IsSuccess,
      reference: data.Data?.Reference,
      cardsCount: data.Data?.Cards?.length || 0,
      message: data.Message,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to get customer details",
          },
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reference: data.Data?.Reference,
      name: data.Data?.Name,
      email: data.Data?.Email,
      mobile: data.Data?.Mobile,
      cards: data.Data?.Cards?.map(card => ({
        token: card.Token,
        brand: card.Brand,
        number: card.Number,
        expiry_month: card.ExpiryMonth,
        expiry_year: card.ExpiryYear,
        name_on_card: card.NameOnCard,
        issuer: card.Issuer,
        issuer_country: card.IssuerCountry,
        funding_method: card.FundingMethod,
      })) || [],
    });
  } catch (error) {
    console.error("MyFatoorah get-customer error:", error);
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
