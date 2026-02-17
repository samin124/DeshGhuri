# DeshGhuri Interview Questions With Answers

This is a practical interview prep sheet based on the current DeshGhuri codebase.

## 1) Stack and Architecture

### Q1. What tech stack is used in this project?
**Answer:** Frontend uses React with TanStack Router/Query and Tailwind. Backend uses Hono. Auth is Better Auth with additional custom guards. Database is PostgreSQL via Drizzle ORM. The repository is a Bun workspace monorepo.

### Q2. Why use a monorepo here?
**Answer:** Shared packages (`@DeshGhuri/auth`, `@DeshGhuri/db`, `@DeshGhuri/env`) are reused by both web and server, which reduces duplication, keeps type contracts aligned, and simplifies version compatibility.

### Q3. What does each top-level app/package do?
**Answer:** `apps/web` is UI and route-level guards, `apps/server` is APIs and business rules, `packages/db` contains schema and migrations, `packages/auth` configures Better Auth and email flows, `packages/env` centralizes env validation.

### Q4. How are roles modeled?
**Answer:** Roles are stored in `user_role` (`customer`, `seller`, `admin`, `super_admin`). A single user can have multiple roles.

### Q5. How is role access enforced?
**Answer:** Frontend checks route access via `requireAdminAccess`, `requireSellerAccess`, and `requireCustomerAccess`. Backend enforces security with middleware (`requireAdmin`) and route isolation (`/api/admin/*`, `/api/seller/*`).

### Q6. Why should backend enforce authorization even if frontend already checks?
**Answer:** Frontend checks are bypassable. Real security must be server-side, otherwise direct API calls can access protected actions.

## 2) Frontend (React, Router, Query)

### Q7. How are protected routes implemented in web?
**Answer:** TanStack route `beforeLoad` calls role guard helpers. If user has no access, it throws router redirects (login or homepage).

### Q8. What is the difference between server state and UI state here?
**Answer:** Server state is fetched/cached via TanStack Query (listings, bookings, roles). UI state is local component/context state (dropdown open state, selected city, search input, carousel index).

### Q9. How is search history implemented?
**Answer:** In `search-autocomplete.tsx`, it stores per-user history in `localStorage` with key `search-history:<userId>`, keeps max 5 items, de-duplicates entries, and shows them on input focus.

### Q10. How is wishlist implemented?
**Answer:** `wishlist-context.tsx` stores per-user favorites in `localStorage` with `wishlist:<userId>`. It loads when session exists and clears in-memory items on logout.

### Q11. Why is lazy-loading used for homepage sections?
**Answer:** Above-the-fold blocks are eager for faster first paint, while below-the-fold modules are lazy-loaded to reduce initial JS and improve startup performance.

### Q12. What responsive strategy was applied?
**Answer:** A consistent wrapper (`max-w-7xl px-4 lg:px-6`) was used across navbar, hero, and sections to keep alignment. Components were also adjusted for small-screen stacking and overflow safety.

### Q13. How would you test navbar search + history?
**Answer:** Unit test parse/serialize logic and limit behavior, then E2E test: login user A and user B, run searches, verify each sees only their own latest 5.

### Q14. What is a likely frontend code issue in current code?
**Answer:** In `redirect-after-login.ts`, `const _data = await response.json();` is followed by `const { roles, primaryRole } = data;` which references `data` instead of `_data`.

## 3) Backend (Hono, Zod, API Design)

### Q15. Why are static listing routes declared before `/:id`?
**Answer:** Route matching order matters. Paths like `/featured` and `/flash-deals` must be declared first so they are not captured by the dynamic `/:id` route.

### Q16. How does signup/signin verification protection work?
**Answer:** Better Auth has `requireEmailVerification: true` and `autoSignIn: false`, plus server-level guards in `apps/server/src/index.ts`:  
- `POST /api/auth/sign-in/email` blocks unverified users  
- `POST /api/auth/sign-up/email` removes session cookie/token and triggers verification email fallback

### Q17. Why add extra server guards if Better Auth already has verification config?
**Answer:** Defense in depth. It prevents accidental auto-login/session creation or edge-case misconfiguration from granting access to unverified accounts.

### Q18. Why use Zod for request validation?
**Answer:** It validates payload shape and constraints at runtime, returns predictable errors, and prevents invalid data from reaching business logic.

### Q19. How are listing filters handled?
**Answer:** Server builds condition arrays (category, location, price range, rating, flash-deal flags, etc.) and applies them in one DB query with sort/pagination.

### Q20. How are reviews restricted to real customers?
**Answer:** Review creation requires logged-in user and an approved/eligible booking for that listing, and disallows duplicate review for the same booking.

### Q21. What endpoint provides homepage section control for admin?
**Answer:** `/api/admin/content/homepage` (`GET` and `PATCH`) reads/updates homepage configuration and records audit logs on update.

### Q22. Why is audit logging important in admin routes?
**Answer:** It provides traceability for sensitive actions (who changed what, when), which is required for debugging, governance, and security reviews.

## 4) Authentication and Security

### Q23. What cookie/security defaults are configured?
**Answer:** Session cookies are set with `httpOnly`, `sameSite=lax`, and `secure` in production. This lowers XSS token theft and some CSRF risk.

### Q24. What is the role of `trustedOrigins` in Better Auth config?
**Answer:** It limits allowed origins for auth-related requests and helps prevent unauthorized cross-origin usage.

### Q25. What is the risk of optional `seller.userId`?
**Answer:** It enables independent seller auth, but can complicate identity linkage and consistency unless mapping rules are carefully enforced.

### Q26. What should be rate-limited first?
**Answer:** Auth endpoints (signin/signup/reset), search/suggestion endpoints, and write-heavy endpoints (view tracking, booking creation).

### Q27. How would you improve brute-force resistance?
**Answer:** Add IP and account-based rate limits, progressive delays, temporary lockouts, and stronger audit signals.

## 5) Database (PostgreSQL + Drizzle)

### Q28. Why mix normalized columns and JSON columns?
**Answer:** Stable relational entities (users, bookings, payouts) stay normalized for integrity and joins, while flexible structures (location object, amenity lists, pricing tiers) use JSON for schema agility.

### Q29. What are key marketplace tables?
**Answer:** `listing`, `booking`, `review`, `escrow_transaction`, `proof_of_completion`, `payout`, plus analytics tables and seller onboarding/verification tables.

### Q30. Explain listing to booking to review flow in DB.
**Answer:** `booking` references `listing` and customer/seller, `review` references both `listing` and `booking`, and listing rating counters are updated after review writes.

### Q31. Why are explicit indexes important here?
**Answer:** High-frequency filters and joins (`status`, `seller_id`, `customer_id`, dates) need indexes to keep query latency stable as data grows.

### Q32. What does `restrict` vs `cascade` achieve in this schema?
**Answer:** `restrict` prevents deleting parent records that still have critical children (e.g., bookings), while `cascade` auto-cleans dependent rows for safe cleanup domains.

### Q33. How would you enforce one review per booking at DB level?
**Answer:** Add a unique index on `review.booking_id` to complement application-level checks.

### Q34. How would you prevent race conditions on counters?
**Answer:** Use atomic SQL updates (`SET count = count + 1`), transactions where needed, and conflict-safe update patterns.

### Q35. What is a schema-level consistency risk already visible?
**Answer:** Seller verification statuses are defined as `pending/in-review/approved/rejected/incomplete`, but some listing filters check for `'verified'`, which can produce incorrect results.

### Q36. How would you optimize flash-deal queries?
**Answer:** Index `(is_flash_deal, status, flash_deal_ends_at)` and query with active status + future end time + ordered expiry.

### Q37. Why keep `oldValue/newValue` JSON in `audit_log`?
**Answer:** It captures before/after snapshots generically across many entity types without needing a custom audit table per domain.

### Q38. How would you scale analytics tables?
**Answer:** Partition by date, pre-aggregate daily metrics, and keep write paths append-only where possible.

## 6) Practical Debug and Code Review

### Q39. What bug can happen with `verifiedOnly` listing filter?
**Answer:** If code checks `seller.verificationStatus === 'verified'` but actual state is `'approved'`, verified seller listings may be filtered out incorrectly.

### Q40. Where can timezone bugs appear?
**Answer:** Flash deal expiry (`flashDealEndsAt`), booking dates, and countdown displays if server UTC and client locale conversions are inconsistent.

### Q41. What is risky about loose `parseInt` query handling?
**Answer:** `NaN`, negative values, and extreme limits can degrade performance or break logic unless clamped and validated.

### Q42. How would you harden search endpoints?
**Answer:** Add input length limits, rate limiting, indexed search strategy, and avoid expensive wildcard patterns on large text columns.

### Q43. How should external service failures be handled?
**Answer:** Fail gracefully with clear client errors, structured logs, retries for transient failures, and dead-letter/retry queues for non-blocking workflows.

### Q44. What tests are highest priority for this project?
**Answer:**  
- Auth flow tests (unverified signup/signin behavior)  
- Role authorization integration tests for admin/seller routes  
- Booking and review eligibility tests  
- API contract tests for listing filters and homepage config

### Q45. How would you answer "What makes this codebase production-ready?"
**Answer:** Strong points: typed stack, role-aware routing, server-side auth guards, structured schema, and audit logging. Gaps to complete: stricter rate limiting, stronger DB constraints for invariants, and broader automated integration test coverage.

