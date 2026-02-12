# "Become a Seller" Onboarding Flow Implementation

## Status: Ready for Testing

### ✅ Completed Tasks - Phase 1 (User-Dependent Auth)

1. **Database Schema**
   - ✅ Added `sellerPaymentMethod` table with fields:
     - id, sellerId, paymentType ('bkash'|'nagad')
     - accountNumber, accountName, verified
   - ✅ Added relations to seller table
   - ✅ Schema pushed to database

2. **Landing Page**
   - ✅ Created `/seller/index.tsx` - "Become a Seller" landing page
   - ✅ Two options presented: Sign Up and Sign In
   - ✅ Benefits section showcasing platform features
   - ✅ Requirements section listing needed documents

3. **Seller Sign-In Page**
   - ✅ Created `/seller/signin.tsx` - Status checking page
   - ✅ Checks user authentication
   - ✅ Verifies email verification status
   - ✅ Shows appropriate messages for:
     - No account: Prompt to register
     - Unverified email: Verification instructions
     - Pending: Application under review
     - Approved: Redirect to dashboard
     - Rejected: Rejection reason + support contact
     - Incomplete: Link to complete application

4. **Seller Registration Page**
   - ✅ Updated `/seller/register.tsx`
   - ✅ Checks user authentication (redirects to signup if not logged in)
   - ✅ Verifies email verification (blocks if not verified)
   - ✅ Checks for existing seller account (redirects to status page)
   - ✅ Shows email verification UI with resend option

5. **Navigation Updates**
   - ✅ Updated navbar (desktop): Link to `/seller` instead of `/seller/register`
   - ✅ Updated navbar (mobile): Same update
   - ✅ Updated footer: "Become a Seller" → `/seller`, "Seller Sign In" → `/seller/signin`

---

### ✅ Completed Tasks - Phase 2 (Independent Auth)

6. **Independent Seller Authentication System**
   - ✅ Updated seller schema: Added `email` field (unique), made `userId` optional
   - ✅ Created `/packages/auth/src/seller-auth.ts` - Seller-specific auth functions
   - ✅ Created `/apps/server/src/routes/seller/auth.ts` - Seller auth API endpoints
   - ✅ Registered seller auth routes in main server (`/api/seller/auth/*`)

7. **New Seller Signup Flow**
   - ✅ Created `/seller/signup` - Email/password collection page
   - ✅ Created `/seller/onboarding-new` - Complete onboarding with business info
   - ✅ Created `OnboardingStep2New` - Simplified document upload (optional)
   - ✅ Created `OnboardingStep4New` - Review page for new flow
   - ✅ Updated Step 3 to handle payment methods (Bkash/Nagad required)

8. **Updated Seller Signin Flow**
   - ✅ Rewrote `/seller/signin` - Independent signin with email/password
   - ✅ Status-based responses: pending, approved, rejected, email-not-verified
   - ✅ Resend verification email functionality
   - ✅ Redirects to dashboard only if approved

9. **Navigation Updates**
   - ✅ Updated `/seller` landing page - Links to new `/seller/signup`
   - ✅ Updated `/seller/register` - Redirects to landing page
   - ✅ Footer and navbar already link to correct pages

---

### 📋 Remaining Tasks

8. **Database Migration**
   - ⏳ Run `bun db:push` to add `email` column to seller table
   - ⏳ Handle existing seller records (may need data migration script)
   - ⏳ Ensure unique constraint on email field

9. **Seller Dashboard Middleware**
   - ⏳ Update `/apps/server/src/middleware/seller-auth.ts` to work with new auth
   - ⏳ Check seller session from seller_auth instead of user auth
   - ⏳ Verify seller is approved before allowing dashboard access

10. **Testing with Chrome MCP**

- ⏳ Test seller signup flow: `/seller/signup` → `/seller/onboarding-new`
- ⏳ Test seller signin flow with different statuses
- ⏳ Test email verification enforcement
- ⏳ Test payment method validation (at least one required)
- ⏳ Test approved seller can access dashboard
- ⏳ Test pending/rejected seller cannot access dashboard

11. **Documentation**

- ⏳ Update API documentation with new endpoints
- ⏳ Create user guide for independent seller auth flow

---

## Implementation Details

### User Flow

```
User clicks "Become a Seller"
  ↓
Landing Page (/seller)
  ├─ Sign Up (New Seller)
  │   ├─ Redirects to /seller/register
  │   ├─ Checks: Logged in? → No: Redirect to /signup
  │   ├─ Checks: Email verified? → No: Show verification UI
  │   ├─ Checks: Has seller account? → Yes: Redirect to /seller/verification-status
  │   ├─ Show category selection
  │   └─ Proceed to /seller/onboarding
  │
  └─ Sign In (Existing Seller)
      ├─ Goes to /seller/signin
      ├─ Checks: Logged in? → No: Redirect to /login
      ├─ Checks: Email verified? → No: Show verification UI
      ├─ Checks: Has seller account? → No: Show "No account" message
      ├─ Check seller status:
      │   ├─ pending: Show "Under review" message
      │   ├─ approved: Redirect to /seller/dashboard
      │   ├─ rejected: Show rejection reason + support
      │   └─ incomplete: Link to complete application
      └─ Display appropriate UI based on status
```

### Database Schema

```sql
CREATE TABLE seller_payment_method (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES seller(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL, -- 'bkash' | 'nagad'
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX seller_payment_method_seller_id_idx ON seller_payment_method(seller_id);
CREATE INDEX seller_payment_method_payment_type_idx ON seller_payment_method(payment_type);
```

### API Endpoints

#### Independent Seller Auth (NEW)

- POST `/api/seller/auth/signup` - Create seller account with email/password
- POST `/api/seller/auth/signin` - Sign in seller (returns session if approved)
- GET `/api/seller/auth/status/:email` - Check seller application status
- POST `/api/seller/auth/resend-verification` - Resend email verification

#### Legacy (User-based, still available)

- POST `/api/seller/register` - Create initial seller record (requires user auth)
- POST `/api/seller/onboarding/complete` - Complete onboarding
- GET `/api/seller/by-user/:userId` - Get seller by user ID
- GET `/api/seller/verification-status/:sellerId` - Get verification status

### Frontend Components

#### New Independent Auth Flow

- `/apps/web/src/routes/seller/signup.tsx` - Email/password collection ✅
- `/apps/web/src/routes/seller/onboarding-new.tsx` - Complete registration flow ✅
- `/apps/web/src/routes/seller/signin.tsx` - Independent signin (rewritten) ✅
- `/apps/web/src/components/seller/onboarding-step-2-new.tsx` - Simplified docs ✅
- `/apps/web/src/components/seller/onboarding-step-4-new.tsx` - Review page ✅

#### Legacy (User-based)

- `/apps/web/src/routes/seller/index.tsx` - Landing page (updated links) ✅
- `/apps/web/src/routes/seller/register.tsx` - Redirects to landing ✅
- `/apps/web/src/routes/seller/onboarding.tsx` - User-based multi-step form
- `/apps/web/src/components/seller/onboarding-step-3.tsx` - With payment methods ✅

---

## Key Rules Implemented

1. ✅ **Email Verification Required**: Email must be verified before seller registration
2. ✅ **One Seller Per User**: Checked via `getSellerByUserId()`
3. ✅ **Email as Primary Identifier**: Used for authentication and seller linking
4. ✅ **Block Access Until Approved**: Seller sign-in page shows status-based UI
5. ⏳ **At Least One Payment Method**: Bkash OR Nagad required (validation pending)
6. ✅ **Reuse Existing Auth**: Uses Better Auth session management
7. ✅ **Seller Linked via user_id**: Database foreign key relationship

---

## Testing Checklist

### New User Flow

- [ ] Click "Become a Seller" from navbar
- [ ] See landing page with two options
- [ ] Click "Sign Up as Seller"
- [ ] Redirected to /signup if not logged in
- [ ] After signup, verify email via link
- [ ] Return to /seller/register
- [ ] See category selection (verified email)
- [ ] Complete 4-step onboarding with payment method
- [ ] Submit application
- [ ] Redirected to verification status page

### Existing Seller Flow

- [ ] Click "Become a Seller"
- [ ] Click "Sign In to Seller Account"
- [ ] If not logged in: Redirect to /login
- [ ] If email not verified: See verification UI
- [ ] If pending: See "Under review" message
- [ ] If approved: Redirect to dashboard
- [ ] If rejected: See rejection reason
- [ ] If incomplete: See completion link

### Edge Cases

- [ ] Admin user tries to become seller: Blocked with error
- [ ] User with existing seller account tries to register again: Redirected to status
- [ ] Email verification link expired: Can resend
- [ ] User tries to access dashboard before approval: Blocked

---

## Environment Variables

No new environment variables needed. Uses existing:

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` for email verification
- Database connection via existing config

---

## Next Steps

1. Complete payment method integration in Step 3
2. Test complete flow end-to-end
3. Update seller dashboard middleware to check email verification
4. Add payment method management in seller dashboard (future)
5. Document the flow for future developers
