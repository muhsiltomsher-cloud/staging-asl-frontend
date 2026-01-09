import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    MYFATOORAH_API_KEY: process.env.MYFATOORAH_API_KEY ? "SET" : "MISSING",
    TABBY_SECRET_KEY: process.env.TABBY_SECRET_KEY ? "SET" : "MISSING",
    TABBY_MERCHANT_CODE: process.env.TABBY_MERCHANT_CODE ? "SET" : "MISSING",
    TAMARA_API_TOKEN: process.env.TAMARA_API_TOKEN ? "SET" : "MISSING",
    WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY ? "SET" : "MISSING",
    WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET ? "SET" : "MISSING",
  });
}
