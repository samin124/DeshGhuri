# Feature to Code Path Mapping

Source: completed-features checklist from your admin panel screenshot.

## Feature Mapping

| Feature | Main paths | Status |
|---|---|---|
| Product listing and detail pages | `apps/web/src/routes/search.tsx`, `apps/web/src/routes/listing/$listingId.tsx`, `apps/server/src/routes/listings.ts` | Implemented |
| Search and filtering | `apps/web/src/routes/search.tsx`, `apps/web/src/components/search/search-autocomplete.tsx`, `apps/server/src/routes/listings.ts` | Implemented |
| Shopping cart (add, remove, persist) | `apps/web/src/components/layout/bookings-cart.tsx`, `apps/web/src/contexts/booking-context.tsx` | Partial (booking-cart style, not classic ecommerce cart) |
| Checkout flow (form based) | `apps/web/src/components/booking/booking-wizard.tsx`, `apps/web/src/components/booking/steps`, `apps/server/src/routes/customer/bookings.ts` | Implemented |
| User registration, login, password reset | `apps/web/src/routes/login.tsx`, `apps/web/src/routes/forgot-password.tsx`, `apps/web/src/routes/reset-password.tsx`, `packages/auth/src/index.ts` | Implemented |
| Order confirmation email and status page | `apps/web/src/components/booking/steps/confirmation-step.tsx`, `apps/web/src/routes/customer/bookings.tsx`, `apps/server/src/routes/customer/bookings.ts` | Partial (status page exists; booking confirmation email flow is not clearly wired) |
| User profiles with order history | `apps/web/src/routes/customer/bookings.tsx`, `apps/web/src/components/user-menu.tsx` | Partial |
| Inventory and stock tracking | `packages/db/src/schema/marketplace.ts`, `apps/server/src/routes/customer/bookings.ts`, `apps/web/src/components/seller/listing-form/step-2-pricing.tsx` | Partial (capacity/availability model) |
| Basic sales analytics | `apps/web/src/routes/seller/dashboard/analytics.tsx`, `apps/server/src/routes/seller/dashboard.ts`, `apps/web/src/routes/admin/_admin/reports/index.tsx` | Partial (seller analytics stronger than admin reports) |
| Responsive/mobile-first design | `apps/web/src/index.css`, `apps/web/src/routes`, `apps/web/src/components` | Implemented |
| SEO basics (meta tags, sitemap, clean URLs) | `apps/web/src/routes/__root.tsx`, `apps/web/src/routes/index.tsx`, `apps/web/public/robots.txt` | Partial (meta/robots present; sitemap not found) |
| Admin panel for products and orders | `apps/web/src/routes/admin/_admin.tsx`, `apps/web/src/routes/admin/_admin/listings/index.tsx`, `apps/web/src/routes/admin/_admin/bookings/index.tsx`, `apps/server/src/routes/admin/listings.ts`, `apps/server/src/routes/admin/bookings.ts` | Implemented |
| Admin order list with filtering and status updates | `apps/web/src/routes/admin/_admin/bookings/index.tsx`, `apps/server/src/routes/admin/bookings.ts` | Partial (backend has placeholder/TODO sections) |
| Vendor dashboard with order list and status updates | `apps/web/src/routes/seller/dashboard/bookings/index.tsx`, `apps/server/src/routes/seller/bookings.ts` | Implemented |
| Vendor product page creation and editing | `apps/web/src/routes/seller/dashboard/listings/new.tsx`, `apps/web/src/routes/seller/dashboard/listings/$listingId/edit.tsx`, `apps/server/src/routes/seller/listings.ts` | Implemented |
| Reviews and ratings | `apps/web/src/routes/listing/$listingId.tsx`, `apps/web/src/routes/seller/dashboard/reviews.tsx`, `apps/server/src/routes/listings.ts`, `apps/server/src/routes/seller/dashboard.ts`, `packages/db/src/schema/marketplace.ts` | Implemented |
| Wishlists | `apps/web/src/contexts/wishlist-context.tsx`, `apps/web/src/components/layout/wishlist-menu.tsx` | Implemented |
| Discount codes and coupons | `packages/db/src/schema/marketplace.ts`, `apps/server/src/routes/customer/bookings.ts`, `apps/web/src/routes/admin/_admin/promotions/index.tsx` | Implemented |
| Multi-image product galleries | `apps/web/src/components/common/listing-detail-sheet.tsx`, `apps/web/src/components/seller/listing-form/step-3-media.tsx`, `packages/db/src/schema/marketplace.ts` | Implemented |
| Advanced search (faceted, autocomplete) | `apps/web/src/routes/search.tsx`, `apps/web/src/components/search/search-autocomplete.tsx`, `apps/server/src/routes/listings.ts` | Implemented |
| Real-time shipping rate integrations | No matching implementation paths found | Missing |
| Social login (Sign in with Google) | `packages/auth/src/index.ts`, `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx` | Implemented |
| Input validation and sanitization | `apps/server/src/routes/listings.ts`, `apps/server/src/routes/customer/bookings.ts`, `apps/server/src/routes/admin`, `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx` | Implemented |
| Rate limiting on auth endpoints | No auth rate-limiter path found | Missing |
| Logging and error monitoring | `apps/server/src/index.ts`, `apps/server/src/lib/audit-log.ts`, `apps/server/src/routes/admin/audit-logs.ts`, `apps/web/src/routes/admin/_admin/audit-logs/index.tsx` | Implemented (basic/app-level) |

## Summary

- Implemented: 17
- Partial: 7
- Missing: 2
