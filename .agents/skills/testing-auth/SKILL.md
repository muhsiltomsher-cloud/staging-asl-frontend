# Testing Auth Flow - staging-asl-frontend

## Local Dev Server

1. Ensure `.env.local` exists (copy from `.env.example` if needed)
2. Run: `cd ~/repos/staging-asl-frontend && npm run dev`
3. Dev server starts on `http://localhost:3000`

## Lint

```bash
cd ~/repos/staging-asl-frontend && npx eslint .
```

## Test Credentials

- WordPress admin: `admin` / stored in secrets (check `Cadvilweb#2026!` pattern)
- Staging frontend: https://app.aromaticscentslab.com/
- Staging WordPress backend: https://staging.aromaticscentslab.com/wp-admin

## Auth Architecture

- Tokens are stored in cookies: `asl_auth_token`, `asl_refresh_token`, `asl_wp_auth_token`
- These cookies are NOT httpOnly because client-side `AuthContext` reads them via `document.cookie` for API calls and auth persistence on page reload
- `asl_auth_user` cookie contains ONLY metadata (user_id, user_email, user_nicename, user_display_name) - tokens are stripped
- Login endpoints: `/api/auth/login` (email/password), `/api/auth/google` (OAuth)
- Logout endpoint: `/api/auth/logout` - reads token from Authorization header OR cookies (fallback)
- Token blocklist: in-memory Set at `src/lib/security/token-blocklist.ts`

## Key Test Flows

### Auth Persistence on Page Reload
1. Login at `/en/login`
2. Verify redirect to `/en/account`
3. Hard refresh (F5) the page
4. Verify still on `/en/account` (not redirected to `/en/login`)

### Token Blocklist on Logout
1. Login and capture the `asl_auth_token` from `document.cookie`
2. Click Logout
3. Verify redirect to `/en/login`
4. Use curl to POST to `/api/auth/verify` with the old token
5. Expect 401 with `"Token has been invalidated"`

### Cookie Verification
1. After login, run `document.cookie` in browser console
2. Verify `asl_auth_user` contains ONLY: user_id, user_email, user_nicename, user_display_name
3. Verify NO token/wp_token/refresh_token keys in `asl_auth_user`

## Security Headers to Verify

- `Content-Security-Policy` header present with all required directives
- No `X-Powered-By` header in responses
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` present
