# DeshGhuri Interview Questions

This document contains interview questions based on the current DeshGhuri codebase, tech stack, and database design.

## 1. Project and Architecture

1. What are the main responsibilities of `apps/web`, `apps/server`, `packages/auth`, and `packages/db` in this monorepo?
2. Why does this project use a monorepo with Bun workspaces instead of separate repositories?
3. How is role-based access enforced across Customer, Seller, and Admin flows?
4. What are the tradeoffs of having both Better Auth sessions and seller-specific session flows?
5. Why are there separate route groups like `/api/admin/*`, `/api/seller/*`, and `/api/listings/*`?
6. How would you explain the request flow from a browser click to DB update for a booking action?
7. What parts of this system are synchronous vs asynchronous, and why?
8. How would you scale this architecture for 10x traffic?
9. Where are the key trust boundaries in this system?
10. What metrics would you track first in production for this marketplace?

## 2. Frontend (React, TanStack Router, Query, Tailwind)

1. Why was TanStack Router chosen here instead of React Router?
2. How does route-level protection work for admin and seller pages?
3. How would you avoid over-fetching on the homepage sections?
4. What caching strategy would you apply in TanStack Query for listing data?
5. How do you handle optimistic UI updates for wishlist and booking interactions?
6. Why is responsive layout consistency important for trust in a marketplace product?
7. In navbar search history, how would you persist max 5 entries per user?
8. How would you prevent layout shift in hero carousel and listing cards?
9. What is your approach to component reuse across dashboard and public pages?
10. How would you test the listing details page interactions end-to-end?
11. What is the difference between server state and UI state in this codebase?
12. How would you reduce bundle size in this app (currently using lazy sections)?
13. What accessibility improvements would you prioritize in the navbar mega menu?
14. How would you design error and loading states for homepage modules?
15. How would you validate that the app is fully responsive across breakpoints?

## 3. Backend (Hono, Zod, Auth, API Design)

1. Why is Zod validation important at API boundaries?
2. In `apps/server/src/index.ts`, why are some auth helper routes mounted before wildcard auth routes?
3. How does the backend prevent unverified users from signing in?
4. Why does signup clear `set-cookie` and token when email is not verified?
5. What problems can happen if auth enforcement exists only on frontend and not backend?
6. How would you version these APIs without breaking existing clients?
7. What are the risks of relying only on client-side filtering for sensitive data?
8. How would you implement rate limiting for endpoints like `/api/listings/:id/view`?
9. Why are admin endpoints wrapped with `requireAdmin` middleware?
10. How would you secure file upload endpoints against abuse?
11. How does the review-creation API ensure only eligible customers can review?
12. Why are listing routes with static paths (`/featured`, `/flash-deals`) defined before `/:id`?
13. How would you improve observability for failed email verification sends?
14. What retry strategy would you use for external integrations (SMTP/Supabase)?
15. How would you handle idempotency for booking/payment endpoints?

## 4. Authentication and Security

1. Explain the current email verification flow from signup to first successful login.
2. Why is `requireEmailVerification: true` not enough by itself in this project?
3. What is the security impact of cookie flags (`httpOnly`, `sameSite`, `secure`)?
4. How would you design session invalidation for suspicious logins?
5. How are roles modeled in `user_role`, and what are pros/cons of this design?
6. What risks exist with optional `seller.userId` and separate seller auth?
7. How would you prevent privilege escalation (customer to admin)?
8. What audit events should always be logged for compliance?
9. How would you secure admin content management endpoints?
10. How would you design account lockout and brute-force protection?

## 5. Database (PostgreSQL + Drizzle)

1. Why use normalized tables for core entities but JSON columns for flexible fields (e.g., `location`, `amenities`)?
2. Explain the relationship between `listing`, `booking`, `review`, and `escrow_transaction`.
3. What are the benefits of explicit indexes like `listing_status_idx` and `booking_customerId_idx`?
4. How would you evaluate whether additional composite indexes are needed?
5. In `listing` table, what are tradeoffs of storing `groupPricingTiers` as JSON?
6. How does referential integrity differ between `onDelete: cascade` and `onDelete: restrict` in this schema?
7. What consistency checks are needed when updating `listing.rating` and `listing.reviewCount`?
8. Why might denormalized counters (`viewCount`, `bookingCount`) be useful?
9. How would you prevent race conditions on counters and promo usage counts?
10. What constraints would you add for stronger payment data integrity?
11. How would you query "top flash deals expiring soon" efficiently?
12. How would you model wishlist persistence for per-user favorites?
13. Why does `audit_log` keep `oldValue` and `newValue` as JSON?
14. How would you partition high-volume tables like `audit_log` or `listing_analytics`?
15. What migration strategy would you use for zero-downtime schema changes?
16. How would you enforce that one booking can have at most one customer review?
17. How would you detect and fix N+1 query issues in Drizzle relations?
18. When would you replace JSON filters with normalized join tables?
19. How would you design backup and restore strategy for this database?
20. What data retention rules would you apply for audit, payment, and personal data?

## 6. Practical Code Review Questions (From Current Code Patterns)

1. In listings filtering, the code checks `seller.verificationStatus === 'verified'` while seller statuses include `approved`. What bug can this create?
2. Where could time zone bugs appear in flash-deal expiry and booking date logic?
3. What issues can arise if `parseInt` query params are not validated strictly?
4. How would you harden the search endpoint against expensive wildcard scans?
5. Why should API responses avoid leaking internal identifiers unnecessarily?
6. What failure modes exist if email service is down during signup?
7. How would you test that unverified users never get authenticated sessions?
8. How would you verify audit logs are always written for sensitive admin actions?
9. What consistency issues can occur between homepage config storage and frontend rendering?
10. Which endpoints here are best candidates for integration tests vs unit tests?

## 7. Scenario-Based System Design Questions

1. Design "Booking History" per user so history appears after login and is isolated per customer.
2. Design a persistent wishlist that survives logout/login but remains user-specific.
3. Design a robust search history (max 5) per user with privacy and performance considerations.
4. Design a seller dashboard analytics pipeline that stays near real-time without heavy DB load.
5. Design admin-controlled flash deals with expiry, rollback, and auditability.
6. Design review moderation workflow with seller responses and abuse reporting.
7. Design package detail caching that still respects inventory/pricing freshness.
8. Design secure media upload flow for listing images and seller documents.
9. Design graceful degradation when Supabase storage is unavailable.
10. Design production deployment for web and API with environment separation and secret management.


