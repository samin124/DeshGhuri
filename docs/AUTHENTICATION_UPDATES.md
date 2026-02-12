# Authentication System Updates - Implementation Guide

## Summary of Changes

This document outlines the authentication improvements implemented to consolidate login flows and improve user experience.

---

## What Was Changed

### 1. **Unified Login Page with Tabs**

- The `/login` page now has **3 tabs**:
  - **Sign In** - For all users (customers, sellers, and admins)
  - **Sign Up** - For new customer account creation
  - **Become a Seller** - Information panel with link to seller registration

### 2. **Consolidated Sign-In Flow**

- **All roles now sign in through the same Sign In page** (`/login`)
- After successful sign-in, the system automatically redirects based on user roles:
  - **Admin/Super Admin** → `/admin/dashboard`
  - **Seller** → `/seller/dashboard`
  - **Customer** → Home page (`/`)
- Removed the separate `/seller/signin` route entirely

### 3. **Email Uniqueness Validation**

- Created backend endpoint `/api/auth/check-email` to prevent duplicate email registration
- Users cannot register with an email that's already used by:
  - Another customer account
  - A seller account
  - An admin account
- Email validation happens **before** database entry

### 4. **Better Auth Signup Flow**

Better Auth (the authentication library used) handles email verification correctly:

- User enters email and password
- Account is created in database with `emailVerified: false`
- Verification email is sent
- **User CANNOT sign in until email is verified** (Better Auth blocks unverified logins)
- Once verified, they can sign in normally

### 5. **Improved Error Messages**

All authentication operations now show clear, context-specific error messages:

- Invalid credentials → "Invalid email or password. Please check your credentials and try again."
- Email already exists → "This email is already registered. Please sign in instead."
- Unverified email → "Please verify your email before signing in." (with resend button)
- Seller verification status → Shows specific messages for pending/approved/rejected status

### 6. **Navbar Updates**

- "Become a Seller" button now links to `/login?tab=seller`
- Opens the login page with the "Become a Seller" tab pre-selected

---

## Files Modified

### Frontend (`apps/web/src/`)

1. **`routes/login.tsx`**
   - Added tabbed interface with Sign In, Sign Up, and Become a Seller tabs
   - Integrated all authentication flows into one page

2. **`components/sign-in-form.tsx`**
   - Added role detection after successful sign-in
   - Shows role-specific success messages
   - Improved error handling with better messages

3. **`components/sign-up-form.tsx`**
   - Added email uniqueness check before registration
   - Improved error messages for duplicate emails and validation failures

4. **`components/layout/navbar.tsx`**
   - Updated "Become a Seller" link to point to `/login?tab=seller`

5. **`components/layout/footer.tsx`**
   - Updated "Seller Sign In" link to point to `/login`

6. **`routes/seller/dashboard.tsx`**
   - Updated to use Better Auth for authentication
   - Checks both session and seller role before allowing access
   - Redirects to `/login` instead of `/seller/signin`

7. **`routes/seller/index.tsx`**
   - Updated sign-in link to point to `/login`

8. **`routes/seller/signup.tsx`**
   - Updated sign-in link to point to `/login`

9. **`routes/seller/onboarding-new.tsx`**
   - Updated redirect after successful registration to `/login`

10. **`routes/__root.tsx`**
    - Removed `/seller/signin` from auth pages detection

11. **DELETED: `routes/seller/signin.tsx`**
    - Seller sign-in is now handled by the main `/login` page

### Backend (`apps/server/src/`)

1. **`routes/auth/check-email.ts` (NEW)**
   - Endpoint to check if email is already registered
   - Returns `{ available: boolean, accountType?: string, message: string }`

2. **`index.ts`**
   - Added route for `/api/auth/check-email`

### Shared Packages

1. **`packages/auth/src/seller-auth.ts`**
   - Added email format validation
   - Improved error messages for duplicate emails

---

## Setup Instructions for Your Teammate

### Prerequisites

Ensure you have:

- **Node.js** (v18+)
- **Bun** (latest version)
- **PostgreSQL** database running
- **Supabase** project configured (for storage and email)

### Installation Steps

1. **Pull the latest changes from the branch:**

   ```bash
   git pull origin seller-dashboard-analytics
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Verify environment variables:**
   Make sure your `.env` file in the root has:

   ```env
   # Database
   DATABASE_URL=postgresql://...

   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000

   # Supabase (for email verification)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key

   # Email configuration
   EMAIL_FROM=your-email@example.com
   # Add your SMTP or email service credentials
   ```

4. **Run database migrations (if any):**

   ```bash
   cd packages/db
   bun run db:migrate
   ```

5. **Start the development servers:**

   **Option 1: Run both servers together**

   ```bash
   bun run dev
   ```

   **Option 2: Run separately**

   ```bash
   # Terminal 1 - Backend
   bun run dev:server

   # Terminal 2 - Frontend
   bun run dev:web
   ```

   - Backend runs on: `http://localhost:3000`
   - Frontend runs on: `http://localhost:3001`

### No Additional Dependencies Required

All necessary dependencies were already present in the project. No new packages were installed.

### Port Management Tool (BONUS!)

To make development easier, we've included a `pkill` utility that kills all development server ports with one command!

**Quick Setup:**

```bash
# Open PowerShell as Administrator
cd E:\Learn-Typescript\DeshGhuri
.\scripts\setup-pkill.ps1
```

**After setup, simply type in PowerShell:**

```powershell
pkill
```

This will automatically kill processes on ports: 3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000

**Alternative (no installation):**

- Double-click `scripts/pkill.bat` to kill ports instantly
- Or run: `.\scripts\pkill.ps1` from the project directory

See `scripts/README.md` for detailed instructions.

---

## Testing Guide

### Test 1: Customer Sign Up & Sign In

1. Navigate to `http://localhost:3001/login`
2. Click the **"Sign Up"** tab
3. Fill in:
   - Name: "Test Customer"
   - Email: "customer@test.com"
   - Password: "Test@1234"
4. Click **"Sign Up"**
5. **Expected:** Success message asking to verify email
6. Check your email for verification link (or check console logs if using fake SMTP)
7. Click verification link
8. Return to `/login`
9. Click **"Sign In"** tab
10. Enter the email and password
11. Click **"Sign In"**
12. **Expected:** Redirected to home page (`/`)

### Test 2: Admin Login

1. Navigate to `http://localhost:3001/login`
2. Make sure you have an admin account in the database
3. Click **"Sign In"** tab
4. Enter admin email and password
5. Click **"Sign In"**
6. **Expected:**
   - Success message: "Welcome back, Admin!"
   - Redirected to `/admin/dashboard`

### Test 3: Seller Login

1. Navigate to `http://localhost:3001/login`
2. Make sure you have a seller account in the database (status: approved)
3. Click **"Sign In"** tab
4. Enter seller email and password
5. Click **"Sign In"**
6. **Expected:**
   - Success message: "Welcome back! Redirecting to your seller dashboard..."
   - Redirected to `/seller/dashboard`

### Test 4: "Become a Seller" Flow

1. Navigate to `http://localhost:3001/login`
2. Click the **"Become a Seller"** tab
3. **Expected:** Information panel showing:
   - What you'll need (documents, etc.)
   - Note about verification and approval process
4. Click **"Continue to Seller Registration"**
5. **Expected:** Redirected to `/seller/signup`
6. Click **"Already have a seller account? Sign in here"**
7. **Expected:** Redirected back to `/login` with Sign In tab active

### Test 5: Email Uniqueness Check

1. Sign up a customer with email "test@example.com"
2. Try to sign up another customer with the same email
3. **Expected:** Error message: "This email is already registered. Please sign in instead."
4. Try to register as a seller with the same email
5. **Expected:** Same error message

### Test 6: Unverified Email Blocking

1. Sign up a new customer but **don't verify** the email
2. Try to sign in with that account
3. **Expected:**
   - Error: "Please verify your email before signing in."
   - **Resend Email** button appears
4. Click **Resend Email**
5. **Expected:** Success message: "Verification email sent! Check your inbox."

### Test 7: Navbar "Become a Seller" Button

1. Navigate to home page
2. Click **"Become a Seller"** button in navbar
3. **Expected:** Redirected to `/login?tab=seller` with "Become a Seller" tab active

### Test 8: Wrong Credentials

1. Navigate to `/login`
2. Enter incorrect email/password
3. **Expected:** Clear error message: "Invalid email or password. Please check your credentials and try again."

---

## Troubleshooting

### Issue: "Port 3000 in use"

**Solution:** Kill the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Email verification not working

**Solution:**

1. Check `.env` has correct email credentials
2. Check server logs for email sending errors
3. For testing, you can manually verify emails in the database:
   ```sql
   UPDATE "user" SET "email_verified" = true WHERE email = 'test@example.com';
   ```

### Issue: Admin can't access admin dashboard

**Solution:** Verify the admin has the correct role:

```sql
-- Check roles
SELECT u.email, ur.role
FROM "user" u
JOIN "user_role" ur ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';

-- If role is missing, add it:
INSERT INTO "user_role" (id, user_id, role, created_at)
VALUES ('role_xxx', 'user_id_here', 'admin', NOW());
```

### Issue: Seller can't access seller dashboard

**Solution:**

1. Check seller has 'seller' role in user_role table
2. Check seller verification status is 'approved':

   ```sql
   SELECT email, verification_status FROM seller WHERE email = 'seller@example.com';

   -- To approve a seller:
   UPDATE seller SET verification_status = 'approved' WHERE email = 'seller@example.com';
   ```

---

## Key Points for Your Teammate

1. **Single Sign-In Point**: All users (customers, sellers, admins) sign in through `/login`
2. **No Separate Seller Login**: The `/seller/signin` route no longer exists
3. **Role-Based Redirects**: The system automatically redirects users to the correct dashboard based on their role
4. **Email Uniqueness**: Emails are unique across all account types (customer, seller, admin)
5. **Better Auth Handles Verification**: Email verification is built into Better Auth - users can't sign in until verified
6. **Clear Error Messages**: All auth errors now have user-friendly, actionable messages

---

## API Endpoints Added

### POST `/api/auth/check-email`

Checks if an email is available for registration.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (available):**

```json
{
  "available": true,
  "message": "Email is available"
}
```

**Response (not available):**

```json
{
  "available": false,
  "accountType": "user",
  "message": "This email is already registered. Please sign in or use a different email."
}
```

---

## Questions?

If you encounter any issues:

1. Check the console logs (browser DevTools and terminal)
2. Verify database schema is up to date
3. Ensure all environment variables are set
4. Check that email service is configured correctly

For any problems, refer to the troubleshooting section or reach out for help!

---

**Last Updated:** 2026-02-08
**Branch:** `seller-dashboard-analytics`
