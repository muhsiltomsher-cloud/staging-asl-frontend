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

interface MyFatoorahTransaction {
  TransactionDate: string;
  PaymentGateway: string;
  ReferenceId: string;
  TrackId: string;
  TransactionId: string;
  PaymentId: string;
  AuthorizationId: string;
  TransactionStatus: string;
  TransactionValue: string;
  CustomerServiceCharge: string;
  DueValue: string;
  PaidCurrency: string;
  PaidCurrencyValue: string;
  IpAddress: string;
  Country: string;
  Currency: string;
  Error: string | null;
  ErrorCode: string;
  CardNumber: string;
  CardBrand: string;
  CardIssuer: string;
  CardIssuingCountry: string;
  CardFundingMethod: string;
}

interface MyFatoorahPaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Array<{ Name: string; Error: string }> | null;
  Data: {
    InvoiceId: number;
    InvoiceStatus: "Paid" | "Unpaid" | "Expired" | "Pending";
    InvoiceReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    UserDefinedField: string;
    InvoiceDisplayValue: string;
    InvoiceTransactions: MyFatoorahTransaction[];
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

    const data: MyFatoorahPaymentStatusResponse = await response.json();

    const transactions = data.Data?.InvoiceTransactions || [];
    const latestTransaction = transactions.length > 0 ? transactions[transactions.length - 1] : null;

    console.log("MyFatoorah verify-payment response:", {
      isSuccess: data.IsSuccess,
      invoiceStatus: data.Data?.InvoiceStatus,
      transactionStatus: latestTransaction?.TransactionStatus,
      errorCode: latestTransaction?.ErrorCode,
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

    const invoiceStatus = data.Data?.InvoiceStatus;
    const successfulTransaction = transactions.find(
      (t) => t.TransactionStatus === "Succss" || t.TransactionStatus === "Success" || t.TransactionStatus === "SUCCESS"
    );
    const failedTransaction = !successfulTransaction
      ? transactions.find((t) => t.TransactionStatus === "Failed" || t.TransactionStatus === "FAILED")
      : null;
    const activeTransaction = successfulTransaction || failedTransaction || latestTransaction;

    const errorCode = failedTransaction?.ErrorCode || latestTransaction?.ErrorCode || "";
    const errorMessage = failedTransaction?.Error || latestTransaction?.Error || "";

    let paymentStatus: "success" | "failed" | "pending";
    let statusMessage: string;

    if (invoiceStatus === "Paid" || successfulTransaction) {
      paymentStatus = "success";
      statusMessage = "Payment completed successfully";
    } else if (invoiceStatus === "Expired") {
      paymentStatus = "failed";
      statusMessage = "Payment session expired. Please try again.";
    } else if (failedTransaction) {
      paymentStatus = "failed";
      statusMessage = errorCode
        ? (ERROR_MESSAGES[errorCode] || errorMessage || "Payment failed")
        : (errorMessage || "Payment failed. Please try again.");
    } else if (invoiceStatus === "Pending" || invoiceStatus === "Unpaid") {
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
      invoice_id: data.Data?.InvoiceId ? String(data.Data.InvoiceId) : null,
      invoice_status: invoiceStatus,
      transaction_id: activeTransaction?.TransactionId || null,
      transaction_status: activeTransaction?.TransactionStatus || null,
      payment_method: activeTransaction?.PaymentGateway || null,
      amount: data.Data?.InvoiceDisplayValue || null,
      currency: activeTransaction?.Currency || null,
      paid_currency: activeTransaction?.PaidCurrency || null,
      paid_currency_value: activeTransaction?.PaidCurrencyValue || null,
      customer_reference: data.Data?.UserDefinedField || null,
      error_code: errorCode || null,
      error_message: errorMessage || null,
      invoice_reference: data.Data?.InvoiceReference || null,
      invoice_value: data.Data?.InvoiceValue ? String(data.Data.InvoiceValue) : null,
      created_date: data.Data?.CreatedDate || null,
      customer_name: data.Data?.CustomerName || null,
      customer_email: data.Data?.CustomerEmail || null,
      customer_mobile: data.Data?.CustomerMobile || null,
      payment_details: {
        payment_id: activeTransaction?.PaymentId || null,
        reference_id: activeTransaction?.ReferenceId || null,
        track_id: activeTransaction?.TrackId || null,
        authorization_id: activeTransaction?.AuthorizationId || null,
        transaction_date: activeTransaction?.TransactionDate || null,
        customer_ip: activeTransaction?.IpAddress || null,
        customer_country: activeTransaction?.Country || null,
        card_brand: activeTransaction?.CardBrand || null,
        card_number: activeTransaction?.CardNumber || null,
        card_issuer: activeTransaction?.CardIssuer || null,
        card_issuer_country: activeTransaction?.CardIssuingCountry || null,
        card_funding_method: activeTransaction?.CardFundingMethod || null,
        payable_amount: activeTransaction?.TransactionValue || null,
        client_deduction: activeTransaction?.CustomerServiceCharge || null,
        receivable_amount: activeTransaction?.DueValue || null,
      },
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
