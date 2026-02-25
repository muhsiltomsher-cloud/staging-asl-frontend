# ASL Staging Frontend - Payment Gateway Development

## Outcome
Work with payment gateway integrations (MyFatoorah, Tabby, Tamara, COD) for the ASL staging e-commerce site.

## Payment Gateways

### MyFatoorah (Credit/Debit Cards)
- **Type**: Card payments (Visa, Mastercard, AMEX)
- **Modes**: Embedded session (inline payment form) and redirect-based
- **API Endpoints**: 7 routes under `/api/myfatoorah/`
- **Config**:
  - `MYFATOORAH_API_KEY` - API key from merchant portal
  - `MYFATOORAH_TEST_MODE` - `"true"` for sandbox
  - `MYFATOORAH_COUNTRY` - Country code (default: `PORTAL`, determines API endpoint)
- **Country-specific API URLs**:
  - UAE/KW/BH/JO/OM: `api-ae.myfatoorah.com`
  - Saudi Arabia: `api-sa.myfatoorah.com`
  - Qatar: `api-qa.myfatoorah.com`
  - Egypt: `api-eg.myfatoorah.com`
  - Portal/Main: `portal.myfatoorah.com`
- **Flow**: Create session/initiate > Customer pays > Verify payment > Update WooCommerce order

### Tabby (Buy Now Pay Later)
- **Type**: BNPL - 4 interest-free installments
- **API Endpoints**: 2 routes under `/api/tabby/`
- **Config**:
  - `TABBY_SECRET_KEY` - API secret key
  - `TABBY_MERCHANT_CODE` - Merchant identifier
- **Flow**: Create session > Redirect to Tabby > Customer approves > Verify payment
- **Statuses**: CREATED, AUTHORIZED, CLOSED, REJECTED, EXPIRED

### Tamara (Buy Now Pay Later)
- **Type**: BNPL - 3-4 interest-free installments
- **API Endpoints**: 2 routes under `/api/tamara/`
- **Config**:
  - `TAMARA_API_TOKEN` - API token
  - `NEXT_PUBLIC_TAMARA_PUBLIC_KEY` - Public key for promo widgets
  - `NEXT_PUBLIC_TAMARA_COUNTRY` - Country code for widget (SA/AE)
  - `TAMARA_TEST_MODE` - `"true"` for sandbox
- **Flow**: Create checkout > Redirect to Tamara > Customer approves > Verify payment
- **Statuses**: new, approved, authorised, captured, declined, canceled, expired, refunded

### Cash on Delivery (COD)
- **Type**: Offline payment
- **Flow**: Order placed > Payment collected on delivery

## Procedure

### 1. Locate Payment Code
- API routes: `src/app/api/myfatoorah/`, `src/app/api/tabby/`, `src/app/api/tamara/`
- UI components: `src/components/payment/`
- Checkout page: `src/app/[locale]/(shop)/checkout/`
- Payment gateways API: `src/app/api/payment-gateways/route.ts`

### 2. Test Payment Flow
- Set test mode environment variables (`MYFATOORAH_TEST_MODE=true`, `TAMARA_TEST_MODE=true`)
- Use test card numbers from gateway documentation
- Verify order status is updated in WooCommerce after payment
- Test both success and failure scenarios

### 3. Verify Order Sync
- After payment, WooCommerce order status should update automatically
- Check `/api/myfatoorah/sync-orders` for MyFatoorah order sync functionality
- Verify order confirmation page shows correctly at `/[locale]/order-confirmation`

## Specifications
- Payment API keys must NEVER be exposed client-side
- All payment API routes are server-side only (Next.js API routes)
- Payment verification always happens server-side for security
- Refund operations are available for MyFatoorah via `/api/myfatoorah/refund`
- The checkout flow supports guest checkout and authenticated checkout

## Advice
- Always use test/sandbox mode during development
- MyFatoorah test mode uses a different API endpoint than production
- Test all payment methods in both English and Arabic checkout
- Verify that currency conversion is correct for each payment method
- Check that the order confirmation page correctly displays in both locales
- The `payment-gateways` API returns which gateways are enabled in WooCommerce

## Forbidden Actions
- Never log or expose payment API keys in responses
- Never store card numbers or sensitive payment data
- Never skip payment verification before confirming orders
- Never test with real payment credentials in development
