# Testing ASL Staging Frontend

## Dev Server Setup
1. Ensure `.env.local` exists with WordPress backend URL and WooCommerce API credentials
2. Run `npm run dev` from repo root — starts Next.js 16.1.1 on port 3000
3. The dev server uses Turbopack which may create separate isolates for proxy.ts and API route handlers

## Devin Secrets Needed
- WordPress admin credentials (username/password) for login testing
- Hostinger credentials if investigating deployment issues

## Test Credentials
- Login page: `/en/login`
- Use the WordPress admin credentials provided by the user

## Backend Dependency
- The WordPress staging backend may have intermittent SSL connectivity issues
- If `curl` to the backend fails with exit code 35 (SSL handshake failure), retry after a few seconds — it's often transient
- F-04 (JWT alg:none rejection) can be tested without the backend since the proxy rejects tokens before reaching handlers
- F-05 and F-08 tests require a successful login, which needs the WordPress backend

## Key Testing Approaches

### Security Features (F-04, F-05, F-08)
- **F-04 (alg:none)**: Construct forged JWT with `{"alg":"none"}` header and empty signature. Send via `Authorization: Bearer` header or `asl_auth_token` cookie to any `/api/*` route. Expect HTTP 401 with `invalid_token_algorithm` error code.
- **F-05 (session invalidation)**: Login, capture cookies, logout, replay the old token. The `/api/auth/me` endpoint does its own `isTokenBlocked()` check. In dev mode (Turbopack), the proxy.ts blocklist may not be shared with API route handlers — the endpoint's own check serves as fallback.
- **F-08 (HttpOnly cookies)**: After login, check `Set-Cookie` headers for `HttpOnly` flag on `asl_auth_token`, `asl_refresh_token`, `asl_wp_auth_token`. The `asl_auth_user` cookie should NOT be HttpOnly (it's user metadata for client-side). Verify `document.cookie` in browser doesn't contain token cookies.

### Browser Testing
- Login flow: Fill `/en/login` form, submit, verify redirect to `/en/account`
- Auth persistence: Refresh `/en/account` page — should still show authenticated state (proves `/api/auth/me` works)
- Logout: Click LOGOUT button on account page — should redirect to `/en/login`
- Cookie banner may appear on first visit — dismiss by clicking "Accept All"

### curl Testing
- Login: `curl -s -D headers.txt -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"username":"...","password":"..."}'`
- Extract cookies from `Set-Cookie` headers using `sed`
- The `/api/auth/me` endpoint requires BOTH `asl_auth_token` AND `asl_auth_user` cookies to return `authenticated:true`

## Known Limitations
- In-memory token blocklist does not survive server restarts
- Turbopack dev mode may use separate isolates for proxy.ts and API routes, meaning blocklist changes in one may not be visible in the other
- The `instrumentation.ts` file generates Edge Runtime warnings about `fs` and `path` imports — these are harmless in dev mode

## Build & Lint
- Build: `npm run build`
- Lint: `npx eslint .`
- Next.js 16.1.1 only supports `proxy.ts` (not `middleware.ts`) — having both causes a build error
