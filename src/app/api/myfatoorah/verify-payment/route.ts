import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";

function getMyFatoorahApiBaseUrl(): string {
  return getEnvVar("MYFATOORAH_TEST_MODE") === "true"
    ? "https://apitest.myfatoorah.com"
    : "https://api.myfatoorah.com";
}

interface MyFatoorahPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    Invoice: {
      Id: string;
      Status: "PAID" | "PENDING" | "EXPIRED";
      Reference: string;
      CreationDate: string;
      ExpirationDate: string;
      ExternalIdentifier: string | null;
      UserDefinedField: string;
      MetaData: unknown;
    };
    Transaction: {
      Id: string;
      Status: "SUCCESS" | "FAILED" | "INPROGRESS" | "AUTHORIZE" | "CANCELED";
      PaymentMethod: string;
      PaymentId: string;
      ReferenceId: string;
      TrackId: string;
      AuthorizationId: string;
      TransactionDate: string;
      ECI: string;
      IP: {
        Address: string;
        Country: string;
      };
      Error: {
        Code: string;
        Message: string;
      };
      Card: {
        NameOnCard: string;
        Number: string;
        Token: string;
        PanHash: string;
        ExpiryMonth: string;
        ExpiryYear: string;
        Brand: string;
        Issuer: string;
        IssuerCountry: string;
        FundingMethod: string;
      } | null;
    };
    Customer: {
      Reference: string;
      Name: string;
      Mobile: string;
      Email: string;
    };
    Amount: {
      BaseCurrency: string;
      ValueInBaseCurrency: string;
      ServiceCharge: string;
      ServiceChargeVAT: string;
      ReceivableAmount: string;
      DisplayCurrency: string;
      ValueInDisplayCurrency: string;
      PayCurrency: string;
      ValueInPayCurrency: string;
    };
    Suppliers: unknown[];
  } | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  MF001: "3DS authentication failed. Please try again or use a different card.",
  MF002: "Transaction declined by your bank. Please check your card details or try a different card.",
  MF003: "Transaction blocked. Please try a different payment method.",
  MF004: "Insufficient funds. Please use a different card.",
  MF005: "Session timeout. Please try again.",
  MF006: "Transaction canceled.",
  MF007: "Card expired. Please use a valid card.",
  MF008: "Card issuer not responding. Please try again later.",
  MF009: "Transaction denied by risk assessment.",
  MF010: "Wrong security code. Please check your CVV.",
  MF020: "Payment failed. Please try again.",
};

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

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_payment_id",
            message: "Payment ID is required",
          },
        },
        { status: 400 }
      );
    }

    console.log("MyFatoorah verify-payment request:", { paymentId });

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

    const data: MyFatoorahPaymentResponse = await response.json();

    console.log("MyFatoorah verify-payment response:", {
      isSuccess: data.IsSuccess,
      invoiceStatus: data.Data?.Invoice?.Status,
      transactionStatus: data.Data?.Transaction?.Status,
      errorCode: data.Data?.Transaction?.Error?.Code,
    });

    if (!response.ok || !data.IsSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.ValidationErrors?.[0]?.Name || "myfatoorah_error",
            message: data.ValidationErrors?.[0]?.Error || data.Message || "Failed to verify payment",
          },
        },
        { status: response.status || 400 }
      );
    }

    const invoiceStatus = data.Data?.Invoice?.Status;
    const transactionStatus = data.Data?.Transaction?.Status;
    const errorCode = data.Data?.Transaction?.Error?.Code;
    const errorMessage = data.Data?.Transaction?.Error?.Message;

    let paymentStatus: "success" | "failed" | "pending";
    let statusMessage: string;

    if (invoiceStatus === "PAID" && transactionStatus === "SUCCESS") {
      paymentStatus = "success";
      statusMessage = "Payment completed successfully";
    } else if (transactionStatus === "FAILED" || transactionStatus === "CANCELED") {
      paymentStatus = "failed";
      statusMessage = errorCode 
        ? (ERROR_MESSAGES[errorCode] || errorMessage || "Payment failed")
        : (errorMessage || "Payment failed. Please try again.");
    } else if (transactionStatus === "INPROGRESS" || transactionStatus === "AUTHORIZE") {
      paymentStatus = "pending";
      statusMessage = "Payment is being processed";
    } else {
      paymentStatus = "pending";
      statusMessage = "Payment status is pending";
    }

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
      status_message: statusMessage,
      invoice_id: data.Data?.Invoice?.Id,
      invoice_status: invoiceStatus,
      transaction_id: data.Data?.Transaction?.Id,
      transaction_status: transactionStatus,
      payment_method: data.Data?.Transaction?.PaymentMethod,
      amount: data.Data?.Amount?.ValueInDisplayCurrency,
      currency: data.Data?.Amount?.DisplayCurrency,
      customer_reference: data.Data?.Invoice?.UserDefinedField,
      error_code: errorCode || null,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error("MyFatoorah verify-payment error:", error);
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
