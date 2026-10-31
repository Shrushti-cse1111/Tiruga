# Tiruga Security Architecture & Access Control

## 1. Who-Can-Read-or-Write Table

| Firestore Path | Read Access | Write Access (Create / Update / Delete) | Enforced By |
| :--- | :--- | :--- | :--- |
| `/destinations/{id}` | **Public** (`true`) | **Forbidden** (`false`) — Server Admin SDK only | `firestore.rules` |
| `/destinations/{id}/attractions/{aid}` | **Public** (`true`) | **Forbidden** (`false`) — Server Admin SDK only | `firestore.rules` |
| `/phrases/{id}` | **Public** (`true`) | **Forbidden** (`false`) — Server Admin SDK only | `firestore.rules` |
| `/transport/{id}` | **Public** (`true`) | **Forbidden** (`false`) — Server Admin SDK only | `firestore.rules` |
| `/users/{uid}` | **Owner only** (`request.auth.uid == uid`) | **Create/Update**: Owner only with strict key allowlist (`name`, `email`, `photoURL`, `language`, `travellerType`, `budget`, `interests`, `travelStyle`, `days`, `createdAt`, `updatedAt`). **Delete**: Forbidden via client rules (handled exclusively by server `DELETE /api/me`). | `firestore.rules` & Admin SDK |
| `/users/{uid}/trips/{tripId}` | **Owner only** (`request.auth.uid == uid`) | **Owner only**; validated fields, totalDays between 1 and 7, max 7 days in array, title $\le 120$ chars, estimatedBudget number. | `firestore.rules` |
| `/users/{uid}/savedPlaces/{savedId}` | **Owner only** (`request.auth.uid == uid`) | **Owner only**; strict key validation (`destinationId`, `attractionId`, `createdAt`). Deterministic document IDs `a_${attractionId}`. | `firestore.rules` |
| `/meta/seed` | **Forbidden** (`false`) | **Forbidden** (`false`) — Server Admin SDK only | `firestore.rules` |

---

## 2. Token Flow & Identity Verification

1. **Client Authentication**:
   - The user authenticates using Firebase Google Auth via `signInWithPopup`.
   - On successful sign-in, an ID token is maintained by the Firebase Client SDK.
2. **API Requests**:
   - For all calls to `/api/ai/*` and `/api/me`, `src/lib/aiClient.ts` fetches a fresh token (`user.getIdToken()`) and sets `Authorization: Bearer <idToken>`.
3. **Server Verification**:
   - `server/middleware/auth.ts` intercepts incoming requests.
   - If no Authorization header is provided, the request proceeds as an unauthenticated guest (`req.user = null`).
   - If an Authorization header is provided, it is validated using Firebase Admin SDK (`auth.verifyIdToken(token)`).
   - If the token is invalid or expired, the server responds with `401 UNAUTHENTICATED` (`{ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Please sign in again.' } }`).
   - `postAi` catches the 401, refreshes the token once with `getIdToken(true)`, and retries once.
4. **UID Spoofing Prevention**:
   - Neither the client nor the server ever reads user identity from URLs, query parameters, or form body fields.
   - User actions always use `req.user.uid` derived directly from the cryptographically verified JWT.

---

## 3. Rate-Limit Tiers

Sliding-window in-memory rate limiting is applied to all incoming requests:

| Limiter Preset | Threshold | Window | Target / Key |
| :--- | :--- | :--- | :--- |
| **aiGuest** | 8 requests | 60 seconds | Remote IP address |
| **aiUser** | 20 requests | 60 seconds | Authenticated Firebase `uid` |
| **general** | 120 requests | 60 seconds | Remote IP address |
| **seed** | 3 requests | 1 hour | Remote IP address (requires `x-seed-secret`) |

When exceeded, endpoints respond with HTTP `429 Too Many Requests` including a `Retry-After` header and `{ ok: false, error: { code: "RATE_LIMITED", message, retryable: true } }`.

---

## 4. Client-Side vs. Server-Side Data Boundary

### What is stored client-side:
- **Local preferences**: `tiruga_prefs` (interests, travel style, budget, days) for instant offline availability.
- **Offline trip cache**: `tiruga_saved_trips` (last generated trip for guest usage and offline resilience).
- **Saved places set**: `tiruga_saved_places` (attraction IDs saved by the user).
- **IndexedDB**: Complete offline travel pack manifests via Dexie.js.

### What is NEVER stored:
- **No private API keys or service account credentials** are ever packaged into the client bundle or stored in localStorage.
- **No tokens or passwords** are stored in plain text.
- **No server configuration values** are exposed to client code.
- **Server logs** never record tokens, Authorization headers, passwords, request bodies, or prompt texts.
