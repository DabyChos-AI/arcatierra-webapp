# Security Review: Arcatierra Webapp

**Date:** 2026-02-28
**Scope:** Payment endpoints (webhooks, checkout), authentication (auth-config, middleware), API routes handling user input
**Methodology:** OWASP Top 10 (2021 edition)
**Status:** Report only -- no fixes applied

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 5     |
| Medium   | 6     |
| Low      | 4     |
| Info     | 3     |

---

## Findings

---

### [CRITICAL-01] MercadoPago Webhook Has No Signature Verification

**Severity:** Critical
**Category:** OWASP A01 (Broken Access Control) / A07 (Identification and Authentication Failures)
**File:** `src/app/api/webhooks/mercadopago/route.ts:4-100`
**CWE:** CWE-345 (Insufficient Verification of Data Authenticity)

#### Description
The MercadoPago webhook endpoint accepts POST requests from any source without verifying the `x-signature` header that MercadoPago sends with every webhook notification. An attacker can send forged webhook payloads to manipulate order statuses, mark unpaid orders as paid, or trigger unauthorized payment updates in the backend.

#### Vulnerable Code
```typescript
// src/app/api/webhooks/mercadopago/route.ts:4
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar que sea una notificacion de Mercado Pago
    if (!body.type || !body.data?.id) {
      // ... only checks structure, not authenticity
    }
    // No x-signature verification. No HMAC validation.
    // Attacker can send: { "type": "payment", "data": { "id": "any_id" } }
```

#### Recommended Fix
Verify the `x-signature` header using MercadoPago's HMAC-SHA256 verification process with the webhook secret. MercadoPago includes `x-signature` and `x-request-id` headers that must be validated using `crypto.createHmac('sha256', webhookSecret)`.

#### Impact
An attacker can forge payment notifications to:
- Mark unpaid orders as "approved" (free goods)
- Cancel legitimate orders by sending "rejected" status
- Trigger arbitrary n8n workflows with fabricated payment data
- Manipulate backend payment records

---

### [CRITICAL-02] Hardcoded Fallback Secret for NextAuth

**Severity:** Critical
**Category:** OWASP A02 (Cryptographic Failures)
**File:** `src/lib/auth-config.ts:238`
**CWE:** CWE-798 (Use of Hard-coded Credentials)

#### Description
The NextAuth secret has a hardcoded fallback value `'development-secret-key'`. If the `NEXTAUTH_SECRET` environment variable is not set in production, all JWT tokens will be signed with this publicly known key, allowing an attacker to forge arbitrary session tokens and impersonate any user including admins.

#### Vulnerable Code
```typescript
// src/lib/auth-config.ts:238
secret: process.env.NEXTAUTH_SECRET || 'development-secret-key',
```

#### Recommended Fix
Remove the fallback entirely and throw an error at startup if `NEXTAUTH_SECRET` is not set:
```typescript
secret: process.env.NEXTAUTH_SECRET ?? (() => { throw new Error('NEXTAUTH_SECRET must be set') })(),
```

#### Impact
If the environment variable is unset, any attacker who knows the fallback secret (which is in source code) can forge JWT tokens to impersonate any user, including administrators, gaining full access to the platform.

---

### [CRITICAL-03] Payment Webhook Endpoint Accepts Any Bearer Token

**Severity:** Critical
**Category:** OWASP A01 (Broken Access Control) / A07 (Identification and Authentication Failures)
**File:** `src/app/api/webhooks/payment/route.ts:7-14`
**CWE:** CWE-287 (Improper Authentication)

#### Description
The `/api/webhooks/payment` endpoint checks only that a Bearer token header is present, but does not validate the token value against any expected secret. Any request with `Authorization: Bearer literally-anything` passes the check.

#### Vulnerable Code
```typescript
// src/app/api/webhooks/payment/route.ts:8-9
const authHeader = request.headers.get('authorization')
if (!authHeader || !authHeader.includes('Bearer')) {
  // Only checks if "Bearer" string exists, not the token value
```

#### Recommended Fix
Compare the Bearer token against a known webhook secret stored in environment variables:
```typescript
const expectedToken = process.env.WEBHOOK_SECRET
if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
```

#### Impact
An attacker can send forged payment status updates (approved, rejected, pending) for any order, leading to order manipulation, inventory discrepancies, and financial fraud.

---

### [HIGH-01] Internal API Secret Leaked in URL Query Parameters

**Severity:** High
**Category:** OWASP A02 (Cryptographic Failures) / A09 (Security Logging and Monitoring Failures)
**File:** `src/lib/auth-config.ts:172`
**CWE:** CWE-598 (Use of GET Request Method With Sensitive Query Strings)

#### Description
The `INTERNAL_API_SECRET` is passed as a URL query parameter when obtaining OAuth tokens for Google-authenticated users. Query parameters are logged in server access logs, browser history, proxy logs, and CDN logs, exposing the secret.

#### Vulnerable Code
```typescript
// src/lib/auth-config.ts:169-172
const internalSecret = process.env.INTERNAL_API_SECRET || ''
const encodedSecret = encodeURIComponent(internalSecret)
const tokenResponse = await fetch(
  `${backendUrl}/api/auth/oauth-token?email=${encodeURIComponent(user.email)}&internal_secret=${encodedSecret}`,
  { method: 'POST', headers: { 'Content-Type': 'application/json' } }
)
```

#### Recommended Fix
Send the `internal_secret` in the request body or as an `Authorization` header instead of a query parameter:
```typescript
const tokenResponse = await fetch(`${backendUrl}/api/auth/oauth-token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Secret': internalSecret,
  },
  body: JSON.stringify({ email: user.email }),
})
```

#### Impact
The internal API secret is exposed in server logs, reverse proxy logs (Traefik), and potentially monitoring systems (Grafana/Prometheus), allowing an attacker with log access to impersonate OAuth token requests.

---

### [HIGH-02] Debug Endpoint Exposed in Production Without Authentication

**Severity:** High
**Category:** OWASP A01 (Broken Access Control) / A05 (Security Misconfiguration)
**File:** `src/app/api/debug-orders/route.ts:1-122`
**CWE:** CWE-489 (Active Debug Code)

#### Description
The `/api/debug-orders` endpoint is a debug/testing endpoint that creates real guest users and payment preferences against the backend API. It requires no authentication and logs extensive internal data including full order payloads, user IDs, and MercadoPago responses. It also hardcodes the production API URL.

#### Vulnerable Code
```typescript
// src/app/api/debug-orders/route.ts:4
export async function POST(request: NextRequest) {
  // No auth check. No rate limiting.
  console.log('=== DEBUG ORDERS ENDPOINT ===')
  const orderData = await request.json()
  console.log('Order data received:', JSON.stringify(orderData, null, 2))
  // ... creates real guest users, real payment preferences
```

#### Recommended Fix
Remove this endpoint entirely from production, or at minimum gate it behind authentication and a `NODE_ENV !== 'production'` check.

#### Impact
An attacker can:
- Create unlimited guest user accounts (potential for abuse)
- Generate unlimited MercadoPago payment preferences
- Observe detailed internal error messages and stack traces in responses
- Use it as an oracle to probe backend API behavior

---

### [HIGH-03] Order API Leaks Internal Error Details to Clients

**Severity:** High
**Category:** OWASP A05 (Security Misconfiguration)
**File:** `src/app/api/orders/route.ts:199-211`
**CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)

#### Description
The orders endpoint returns internal error messages and stack traces in the HTTP response body. This reveals implementation details, file paths, and potentially database error messages to attackers.

#### Vulnerable Code
```typescript
// src/app/api/orders/route.ts:199-211
console.error('Error details:', {
  message: error instanceof Error ? error.message : 'Unknown error',
  stack: error instanceof Error ? error.stack : undefined   // stack trace logged
})

return NextResponse.json(
  {
    error: 'Error interno del servidor',
    details: error instanceof Error ? error.message : 'Unknown error'  // leaked to client
  },
  { status: 500 }
)
```

Same pattern in:
- `src/app/api/debug-orders/route.ts:117` -- leaks `error.message` in `details` field
- `src/app/api/cart/add/route.ts:30` -- leaks `error.message` in `detail` field

#### Recommended Fix
Never expose internal error details in API responses. Log them server-side only:
```typescript
console.error('Error procesando orden:', error)
return NextResponse.json(
  { error: 'Error interno del servidor' },
  { status: 500 }
)
```

#### Impact
Attackers can probe the API to collect error messages revealing internal architecture, backend API structure, database schema hints, and file paths useful for crafting more targeted attacks.

---

### [HIGH-04] Cart API Endpoints Have No Authentication

**Severity:** High
**Category:** OWASP A01 (Broken Access Control)
**File:** `src/app/api/cart/route.ts:3-25`, `src/app/api/cart/add/route.ts:3-34`
**CWE:** CWE-862 (Missing Authorization)

#### Description
Both the cart GET and cart POST (add) endpoints accept requests without any authentication. The GET endpoint accepts an email query parameter and returns that user's cart contents. The POST endpoint forwards arbitrary body data to the backend. Any unauthenticated user can view or modify any other user's cart.

#### Vulnerable Code
```typescript
// src/app/api/cart/route.ts:3 - GET endpoint
export async function GET(request: NextRequest) {
  const email = searchParams.get('email');
  // No auth check -- anyone can query any user's cart by email
  const response = await fetch(`http://arca-api:8000/api/cart/?email=${encodeURIComponent(email)}`);

// src/app/api/cart/add/route.ts:3 - POST endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  // No auth check -- anyone can add items to any cart
  const response = await fetch('http://arca-api:8000/api/cart/add', { ... body });
```

#### Recommended Fix
Add session verification before processing cart operations:
```typescript
const session = await getServerSession(authOptions)
if (!session?.user?.email) {
  return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
}
// Use session.user.email instead of client-supplied email
```

#### Impact
An attacker can enumerate user carts by email address, view what other users have in their carts (information disclosure), and manipulate other users' carts by adding or removing items.

---

### [HIGH-05] Subscription Creation Endpoint Has No Authentication

**Severity:** High
**Category:** OWASP A01 (Broken Access Control)
**File:** `src/app/api/subscriptions/crear/route.ts:3-35`
**CWE:** CWE-862 (Missing Authorization)

#### Description
The subscription creation endpoint is an unauthenticated proxy that forwards any JSON body directly to the backend without validating the user's session. An attacker can create subscriptions for any user ID.

#### Vulnerable Code
```typescript
// src/app/api/subscriptions/crear/route.ts:3
export async function POST(request: NextRequest) {
  // No session check. No auth token. No user validation.
  const body = await request.json()
  const response = await fetch(`${INTERNAL_API_URL}/api/subscriptions/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)   // Arbitrary body forwarded
  })
```

#### Recommended Fix
Require authentication and validate that the user in the request body matches the authenticated session.

#### Impact
An attacker can create subscriptions for arbitrary users, potentially triggering recurring charges or manipulating subscription states.

---

### [MEDIUM-01] Access Token Stored in localStorage

**Severity:** Medium
**Category:** OWASP A07 (Identification and Authentication Failures)
**File:** `src/app/crear-cuenta/CreateAccountContent.tsx:104`
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)

#### Description
After account creation, the access token is stored in `localStorage`, which is accessible to any JavaScript running on the page. If an XSS vulnerability exists anywhere in the application, the token can be exfiltrated.

#### Vulnerable Code
```typescript
// src/app/crear-cuenta/CreateAccountContent.tsx:104
if (result.access_token) {
  localStorage.setItem('token', result.access_token)
}
```

#### Recommended Fix
Use httpOnly cookies for token storage via NextAuth's session management (which the app already uses elsewhere). Remove the localStorage token storage entirely since the app uses NextAuth JWT sessions for all other authenticated requests.

#### Impact
If any XSS vulnerability is exploited, the attacker can steal the access token from localStorage and make authenticated API calls on behalf of the user.

---

### [MEDIUM-02] Hardcoded Production Backend URL in Multiple Files

**Severity:** Medium
**Category:** OWASP A05 (Security Misconfiguration)
**Files:**
- `src/app/api/webhooks/mercadopago/route.ts:52` -- hardcoded `https://api.dabychos.com`
- `src/app/api/debug-orders/route.ts:38,74` -- hardcoded `https://api.dabychos.com`
- `src/middleware.ts:21` -- hardcoded `https://api.dabychos.com`
- `src/components/header/hooks/useCart.tsx:122` -- hardcoded `https://api.dabychos.com`
- `src/components/CheckoutFormSingleStep.tsx:59` -- hardcoded `https://api.dabychos.com`
- `src/components/SubscriptionCheckoutForm.tsx:83` -- hardcoded `https://api.dabychos.com`
**CWE:** CWE-547 (Use of Hard-coded, Security-relevant Constants)

#### Description
Multiple files hardcode the production API URL `https://api.dabychos.com` instead of reading from environment variables. This is inconsistent with other files that use `process.env.NEXT_PUBLIC_API_URL` or `process.env.INTERNAL_API_URL`. The webhook file sends payment data to the hardcoded URL even in development, potentially leaking test data to production.

#### Recommended Fix
Replace all hardcoded URLs with environment variables:
```typescript
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://arca-api:8000'
```

#### Impact
Development/staging environments may inadvertently send requests to the production backend. In the webhook handler, test webhook data could create real payment records in production.

---

### [MEDIUM-03] Fallback Bearer Token Uses User ID or Literal 'demo'

**Severity:** Medium
**Category:** OWASP A07 (Identification and Authentication Failures)
**Files:**
- `src/hooks/useDashboard.ts:106` -- `Bearer ${session?.accessToken || 'demo'}`
- `src/components/header/hooks/useCart.tsx:125` -- `Bearer ${session.accessToken || session.user.id}`
**CWE:** CWE-287 (Improper Authentication)

#### Description
When the access token is not available, the code sends either the literal string `'demo'` or the user's ID as a Bearer token. The backend may accept these invalid tokens, or the `'demo'` string may be a valid backdoor token in development that was left in production code.

#### Vulnerable Code
```typescript
// src/hooks/useDashboard.ts:106
'Authorization': `Bearer ${session?.accessToken || 'demo'}`

// src/components/header/hooks/useCart.tsx:125
'Authorization': `Bearer ${session.accessToken || session.user.id}`
```

#### Recommended Fix
Never send fallback tokens. If no access token exists, do not make the authenticated request:
```typescript
if (!session?.accessToken) {
  // Handle unauthenticated state appropriately
  return
}
```

#### Impact
The `'demo'` fallback could be a valid token if the backend has a demo/test mode. Using user IDs as Bearer tokens exposes user IDs in HTTP logs and could bypass authentication if the backend has a misconfigured token validation.

---

### [MEDIUM-04] No Rate Limiting on Authentication and Payment Endpoints

**Severity:** Medium
**Category:** OWASP A04 (Insecure Design)
**Files:**
- `src/app/api/auth/create-account/route.ts` -- account creation
- `src/app/api/orders/route.ts` -- order creation
- `src/app/api/webhooks/mercadopago/route.ts` -- webhook processing
- `src/app/api/webhooks/payment/route.ts` -- payment webhook
- `src/app/api/subscriptions/crear/route.ts` -- subscription creation
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)

#### Description
No rate limiting is implemented on any of the API endpoints. Critical operations (account creation, order creation, payment processing, webhook handling) can be called at unlimited frequency by any client.

#### Recommended Fix
Implement rate limiting using either Next.js middleware, a dedicated rate limiting package (e.g., `@upstash/ratelimit`), or Traefik rate limiting labels in docker-compose. At minimum:
- Login/register: 5 requests per minute per IP
- Order creation: 10 requests per minute per user
- Webhooks: IP-based allowlist for MercadoPago IPs

#### Impact
Attackers can perform:
- Brute-force account enumeration
- Mass order creation (resource exhaustion, inventory manipulation)
- Webhook flooding (overwhelming the backend)
- Credential stuffing attacks against the login flow

---

### [MEDIUM-05] Orders API Uses Weak Order ID Generation

**Severity:** Medium
**Category:** OWASP A02 (Cryptographic Failures)
**File:** `src/app/api/orders/route.ts:98`
**CWE:** CWE-330 (Use of Insufficiently Random Values)

#### Description
Order IDs and account creation tokens are generated using `Date.now()` and `Math.random()`, neither of which is cryptographically secure. `Math.random()` is not a CSPRNG and order IDs may be predictable.

#### Vulnerable Code
```typescript
// src/app/api/orders/route.ts:98
const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// src/app/api/orders/route.ts:158
accountCreationToken = `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

#### Recommended Fix
Use `crypto.randomUUID()` or `crypto.randomBytes()` for generating order IDs and tokens:
```typescript
import { randomUUID } from 'crypto'
const orderId = `ORD-${randomUUID()}`
```

#### Impact
An attacker could predict order IDs or account creation tokens by brute-forcing the weak random values, potentially claiming another user's account creation link.

---

### [MEDIUM-06] Middleware Uses Hardcoded URL and No Caching for Employee Check

**Severity:** Medium
**Category:** OWASP A05 (Security Misconfiguration) / A04 (Insecure Design)
**File:** `src/middleware.ts:21`
**CWE:** CWE-547 (Use of Hard-coded, Security-relevant Constants)

#### Description
The admin route protection middleware calls the external API `https://api.dabychos.com` on every single request to admin pages. This hardcoded URL bypasses the internal network, sending the request over the public internet. Additionally, if the API is down, the error is silently caught and the user is redirected (fail-closed, which is good), but the employee check has no caching, creating a performance bottleneck and potential DoS vector.

#### Vulnerable Code
```typescript
// src/middleware.ts:21
const response = await fetch(
  `https://api.dabychos.com/api/auth/check-employee?email=${encodeURIComponent(userEmail)}`
)
```

#### Recommended Fix
Use the internal API URL (`http://arca-api:8000`) and consider caching the employee check result in the JWT token at login time.

#### Impact
Every admin page navigation makes an external HTTP call, which is slower and exposes the request to network interception. If the external API is DDoS'd, all admin access is denied.

---

### [LOW-01] Weak Password Policy

**Severity:** Low
**Category:** OWASP A07 (Identification and Authentication Failures)
**Files:**
- `src/app/api/auth/create-account/route.ts:30` -- backend validates only length >= 8
- `src/app/crear-cuenta/CreateAccountContent.tsx:26-31` -- frontend validates length, uppercase, lowercase, number
**CWE:** CWE-521 (Weak Password Requirements)

#### Description
The backend API only enforces a minimum length of 8 characters. The frontend enforces uppercase, lowercase, and number requirements, but these can be bypassed by sending requests directly to the API. No special character requirement. No check against breached password databases.

#### Recommended Fix
Enforce password complexity on the backend (not just frontend). Consider minimum 12 characters and checking against known breached passwords (HaveIBeenPwned API).

#### Impact
Users may set weak passwords that are vulnerable to dictionary attacks or credential stuffing.

---

### [LOW-02] Missing Security Headers

**Severity:** Low
**Category:** OWASP A05 (Security Misconfiguration)
**File:** `next.config.ts:39-58`
**CWE:** CWE-693 (Protection Mechanism Failure)

#### Description
While some security headers are configured (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), several important headers are missing:
- `Content-Security-Policy` (CSP) -- most important missing header
- `Strict-Transport-Security` (HSTS)
- `Permissions-Policy`
- `X-XSS-Protection` (legacy but still useful for older browsers)

Also, `Referrer-Policy` is set to `origin-when-cross-origin` (less restrictive) rather than `strict-origin-when-cross-origin` as documented in CLAUDE.md.

#### Recommended Fix
Add the missing headers in `next.config.ts`:
```typescript
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..." },
{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
```

#### Impact
Without CSP, any XSS vulnerability can load arbitrary scripts. Without HSTS, downgrade attacks are possible.

---

### [LOW-03] `dangerouslySetInnerHTML` Used in Multiple Components

**Severity:** Low
**Category:** OWASP A03 (Injection)
**Files:**
- `src/app/layout.tsx:144,240` -- JSON-LD structured data and inline scripts
- `src/components/layout/Footer.tsx:195` -- JSON-LD structured data
- `src/components/baldio/BaldioSustainabilityStory.tsx:75`
- `src/app/tienda/page.tsx:931,937` -- Structured data
- `src/app/receta/[id]/page.tsx:121` -- Recipe structured data

#### Description
Multiple uses of `dangerouslySetInnerHTML` throughout the application. Most instances use `JSON.stringify()` on static data (JSON-LD/Schema.org), which is safe. However, the pattern normalizes the use of this dangerous API. The `BaldioSustainabilityStory` and `receta` page instances should be verified for dynamic content.

#### Recommended Fix
Audit each usage. For JSON-LD, `JSON.stringify()` on static objects is safe. For any instance using dynamic/user-provided data, switch to text content or sanitize with DOMPurify.

#### Impact
Low risk for current static usages. Risk increases if future developers add dynamic content using this same pattern without sanitization.

---

### [LOW-04] `javascript:void(0)` Used in href Attributes

**Severity:** Low
**Category:** OWASP A03 (Injection)
**File:** `src/components/layout/TransparentHeader.tsx:779,790`
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

#### Description
The `javascript:` protocol is used in `href` attributes. While the current usage is `javascript:void(0)` (harmless), this pattern is a bad practice that normalizes `javascript:` URLs in the codebase. The code is currently inside a disabled block (commented out), but it remains in the source.

#### Recommended Fix
Replace with `href="#"` and `e.preventDefault()`, or use `<button>` elements instead of anchor tags for non-navigation actions.

#### Impact
Minimal direct risk since the code is disabled. However, it sets a precedent for future code where `javascript:` URLs could be used with dynamic values.

---

### [INFO-01] Vulnerable npm Dependencies

**Severity:** Info
**Category:** OWASP A06 (Vulnerable and Outdated Components)
**File:** `package.json`

#### Description
`npm audit` reports 8 vulnerabilities:
- **2 Critical:** Swiper (prototype pollution, GHSA-hmx5-qpq5-p643), Next.js (RCE in React flight protocol, GHSA-9qr9-h5gf-34mp)
- **2 High:** glob (command injection via CLI), minimatch (ReDoS)
- **3 Moderate:** ajv (ReDoS), js-yaml (prototype pollution), next-auth (email misdelivery GHSA-5jpx-9hw9-2fx4)
- **1 Low:** @eslint/plugin-kit (ReDoS)

Notable: The **Next.js** critical vulnerability (RCE via React flight protocol) and the **next-auth** moderate vulnerability (email misdelivery) are in direct dependencies that handle security-critical functionality.

#### Recommended Fix
```bash
npm audit fix        # Fix non-breaking changes (next-auth)
npm audit fix --force # Fix breaking changes (next, swiper) -- requires testing
```

#### Impact
The Next.js RCE vulnerability is potentially exploitable remotely. The next-auth email misdelivery could affect OAuth flows.

---

### [INFO-02] Orders API Allows Guest Checkout Without Verification

**Severity:** Info
**Category:** OWASP A04 (Insecure Design)
**File:** `src/app/api/orders/route.ts:34-63`

#### Description
The orders API allows guest checkout by creating a guest user account from client-supplied data (email, name, phone). The email is not verified. This could be used to:
1. Create orders with fake/other people's email addresses
2. Spam the system with fake guest accounts
3. Use the account creation flow to send unsolicited emails (if email notifications are enabled)

#### Recommended Fix
Implement email verification for guest checkout, or at minimum add CAPTCHA to prevent automated abuse.

#### Impact
Low immediate risk, but could be exploited for email spam or social engineering if order confirmation emails are sent to unverified addresses.

---

### [INFO-03] `@ts-ignore` Comments Suppress Type Safety

**Severity:** Info
**Category:** Code Quality
**Files:**
- `src/app/api/webhooks/mercadopago/route.ts:1` -- `@ts-ignore - Next.js types issue temporary fix`
- `src/app/api/webhooks/mercadopago/route.ts:23,68` -- `@ts-ignore - Process env access`
- `src/app/api/orders/route.ts:2` -- `@ts-ignore - NextAuth types issue temporary fix`
- `src/app/api/debug-orders/route.ts:1` -- `@ts-ignore`

#### Description
Multiple `@ts-ignore` directives suppress TypeScript type checking in security-critical files. This prevents the compiler from catching type-related bugs that could lead to security issues.

#### Recommended Fix
Fix the underlying type issues instead of suppressing them. Use proper type assertions or update type declarations.

---

## Passed Checks

- [PASS] No `eval()`, `exec()`, or `Function()` calls found in application code
- [PASS] No raw SQL queries or string interpolation in database operations (app uses backend API, not direct DB)
- [PASS] CORS is not explicitly configured in Next.js (defaults to same-origin, which is correct)
- [PASS] NextAuth session strategy uses JWT (not database sessions), reducing session fixation risk
- [PASS] Admin proxy (`admin-api-helper.ts`) correctly verifies session authentication before forwarding
- [PASS] User-facing API routes (`direcciones`, `dashboard`) correctly verify session before processing
- [PASS] `X-Frame-Options: DENY` prevents clickjacking
- [PASS] `X-Content-Type-Options: nosniff` prevents MIME-type sniffing
- [PASS] Password hashing is delegated to the backend (FastAPI with bcrypt)
- [PASS] Google OAuth client credentials loaded from environment variables
- [PASS] Token refresh logic has proper expiration handling (23h lifetime, 1h before backend expiry)
- [PASS] Delivery validation endpoint uses server-side logic only (no client-controlled URLs)
- [PASS] Admin routes are middleware-protected and require employee verification via backend API

---

## Priority Remediation Order

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | CRITICAL-01: MercadoPago webhook signature verification | Medium |
| 2 | CRITICAL-03: Payment webhook token validation | Low |
| 3 | CRITICAL-02: Remove hardcoded NextAuth fallback secret | Low |
| 4 | HIGH-02: Remove/protect debug-orders endpoint | Low |
| 5 | HIGH-04: Add auth to cart endpoints | Medium |
| 6 | HIGH-05: Add auth to subscription creation | Low |
| 7 | HIGH-01: Move internal secret from URL to headers | Low |
| 8 | HIGH-03: Remove error details from responses | Low |
| 9 | MEDIUM-04: Implement rate limiting | Medium |
| 10 | MEDIUM-02: Replace hardcoded URLs with env vars | Low |
| 11 | MEDIUM-03: Remove fallback Bearer tokens | Low |
| 12 | MEDIUM-05: Use crypto-secure random for IDs | Low |
| 13 | INFO-01: Update vulnerable dependencies | Medium |
| 14 | Remaining LOW/INFO findings | Low |
