import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";

function parsePhoneForMyFatoorah(phone: string | undefined): { localNumber: string; countryCode: string } {
  if (!phone) return { localNumber: "", countryCode: "" };
  
  let normalized = phone.replace(/[\s\-\(\)]/g, "");
  
  let hasInternationalPrefix = false;
  if (normalized.startsWith("+")) {
    hasInternationalPrefix = true;
    normalized = normalized.substring(1);
  } else if (normalized.startsWith("00")) {
    hasInternationalPrefix = true;
    normalized = normalized.substring(2);
  }
  
  const countryCodes = [
    "1242", "1246", "1264", "1268", "1284", "1340", "1345", "1441",
    "1473", "1649", "1658", "1664", "1670", "1671", "1684", "1721",
    "1758", "1767", "1784", "1787", "1809", "1829", "1849", "1868",
    "1869", "1876", "1939",
    "971", "966", "965", "973", "968", "974", "962", "972",
    "963", "964", "967", "970", "961", "960",
    "880", "886", "852", "853", "855", "856",
    "212", "213", "216", "218",
    "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
    "230", "231", "232", "233", "234", "235", "236", "237", "238", "239",
    "240", "241", "242", "243", "244", "245", "246", "247", "248", "249",
    "250", "251", "252", "253", "254", "255", "256", "257", "258", "259",
    "260", "261", "262", "263", "264", "265", "266", "267", "268", "269",
    "290", "291", "297", "298", "299",
    "350", "351", "352", "353", "354", "355", "356", "357", "358", "359",
    "370", "371", "372", "373", "374", "375", "376", "377", "378", "380", "381",
    "382", "383", "385", "386", "387", "389",
    "420", "421",
    "423",
    "500", "501", "502", "503", "504", "505", "506", "507", "508", "509",
    "590", "591", "592", "593", "594", "595", "596", "597", "598", "599",
    "670", "672", "673", "674", "675", "676", "677", "678", "679",
    "680", "681", "682", "683", "685", "686", "687", "688", "689",
    "690", "691", "692",
    "850", "852", "853", "855", "856",
    "870", "880", "886",
    "960", "961", "962", "963", "964", "965", "966", "967", "968",
    "970", "971", "972", "973", "974", "975", "976", "977",
    "992", "993", "994", "995", "996", "998",
    "20", "27",
    "30", "31", "32", "33", "34", "36", "39",
    "40", "41", "43", "44", "45", "46", "47", "48", "49",
    "51", "52", "53", "54", "55", "56", "57", "58",
    "60", "61", "62", "63", "64", "65", "66",
    "81", "82", "84", "86",
    "90", "91", "92", "93", "94", "95", "98",
    "1", "7"
  ];
  
  let detectedCode = "";
  if (hasInternationalPrefix) {
    for (const code of countryCodes) {
      if (normalized.startsWith(code)) {
        detectedCode = code;
        normalized = normalized.substring(code.length);
        break;
      }
    }
  }
  
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1);
  }
  
  return {
    localNumber: normalized.substring(0, 11),
    countryCode: detectedCode ? `+${detectedCode}` : "",
  };
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
    
    if (!apiKey || apiKey === "your_myfatoorah_api_key_here") {
      const isPlaceholder = apiKey === "your_myfatoorah_api_key_here";
      console.error(`MyFatoorah API Error: MYFATOORAH_API_KEY is ${isPlaceholder ? "still set to placeholder value" : "not configured"}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_api_key",
            message: "Payment gateway is not configured. Please set a valid MyFatoorah API key.",
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
      currency = "AED",
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
      const parsedPhone = parsePhoneForMyFatoorah(customer_phone);
      sessionData.Customer = {
        ...(customer_name && { Name: customer_name }),
        ...(customer_email && { Email: customer_email }),
        ...(customer_phone && { Mobile: parsedPhone.localNumber }),
        ...(parsedPhone.countryCode && { MobileCountryCode: parsedPhone.countryCode }),
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
      console.error("MyFatoorah create-session error:", JSON.stringify({
        status: response.status,
        isSuccess: data.IsSuccess,
        message: data.Message,
        validationErrors: data.ValidationErrors,
        apiUrl: url,
        testMode: getEnvVar("MYFATOORAH_TEST_MODE"),
        country: getEnvVar("MYFATOORAH_COUNTRY"),
      }));

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "unauthorized",
              message: "Payment gateway authentication failed. The MyFatoorah API key is invalid or expired. Please update MYFATOORAH_API_KEY in your environment variables.",
            },
          },
          { status: 401 }
        );
      }

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
