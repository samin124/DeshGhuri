# Single Role Enforcement - Implementation Guide

## Overview

This document describes the implementation of **strict one-role-per-email enforcement** in the DeshGhuri application. Each email address can only be associated with ONE account type/role.

---

## What Changed

### Previous System (Multi-Role)

- ❌ Users could have multiple roles (e.g., admin + seller + customer)
- ❌ Role switcher allowed switching between roles
- ❌ Same email could be used for different account types
- ❌ Complex role management and confusing UX

### New System (Single Role)

- ✅ **One email = One role** (strict enforcement)
- ✅ No role switching capability
- ✅ Email cannot be reused across different account types
- ✅ Simple, clear account management

---

## Role Types

Each email can be assigned to ONLY ONE of these roles:

1. **Super Admin** - Platform super administrator
2. **Admin** - Platform administrator
3. **Seller** - Business/seller account
4. **Customer** - Regular user account

**Rule**: If `user@example.com` is registered as a Seller, it CANNOT be used to create a Customer, Admin, or Super Admin account.

---

## Changes Made

### 1. **UI Changes**

#### Removed Components:

- ❌ `RoleSwitcher` component (deleted from all layouts)
- ❌ Role switching buttons
- ❌ Multi-role indicators

#### Updated Components:

- ✅ **Navbar** (`apps/web/src/components/layout/navbar.tsx`)
  - Removed RoleSwitcher

- ✅ **Admin Layout** (`apps/web/src/components/admin/admin-layout.tsx`)
  - Removed RoleSwitcher from header

- ✅ **Seller Dashboard Layout** (`apps/web/src/components/seller/dashboard-layout.tsx`)
  - Removed RoleSwitcher from desktop and mobile views

### 2. **Backend Changes**

#### Updated Endpoints:

**`/api/auth/check-email` (Enhanced)**

```typescript
// Now checks:
// 1. User table (customer/admin accounts)
// 2. Seller table (seller accounts)
// Returns error if email exists in ANY table
```

**Error Messages:**

- "This email is already registered. Each email can only be used for one account type. Please sign in or use a different email."

#### Validation Flow:

```
User tries to register with email
  ↓
Check user table → Found? → Error: Email already registered
  ↓ Not found
Check seller table → Found? → Error: Email already registered
  ↓ Not found
Allow registration
```

### 3. **Database Cleanup Script**

**File**: `apps/server/src/scripts/cleanup-duplicate-roles.ts`

**Purpose**: Remove duplicate roles from existing database

**What it does**:

1. Scans all users for multiple role entries
2. Keeps only the HIGHEST priority role:
   - Priority: super_admin > admin > seller > customer
3. Deletes duplicate role entries
4. Verifies no duplicates remain

**Usage**:

```bash
cd apps/server
bun run scripts/cleanup-duplicate-roles.ts
```

**Example Output**:

```
🔍 Starting duplicate roles cleanup...

📊 Total users: 25
📊 Total role entries: 35

⚠️  Found 3 users with multiple roles:

👤 User: admin@example.com
   Current roles: admin, customer
   ✅ Keeping: admin
   ❌ Deleted: customer

👤 User: seller@example.com
   Current roles: seller, customer
   ✅ Keeping: seller
   ❌ Deleted: customer

📋 Cleanup Summary:
   - Users processed: 3
   - Roles kept: 3
   - Roles deleted: 10

✅ Cleanup successful! All users now have exactly one role.
```

---

## How It Works Now

### Scenario 1: New User Signup

```
1. User enters email: user@example.com
2. Frontend checks /api/auth/check-email
3. Backend checks:
   - User table → NOT FOUND ✅
   - Seller table → NOT FOUND ✅
4. Email available, allow registration
5. Create account with "customer" role
6. Email: user@example.com is now LOCKED to customer role
```

### Scenario 2: Existing Email Attempt

```
1. Seller tries to register with: user@example.com
2. Frontend checks /api/auth/check-email
3. Backend checks:
   - User table → FOUND ❌
4. Error: "This email is already registered..."
5. Registration blocked
```

### Scenario 3: Existing Seller Email

```
1. Customer tries to register with: seller@example.com
2. Frontend checks /api/auth/check-email
3. Backend checks:
   - User table → NOT FOUND
   - Seller table → FOUND ❌
4. Error: "This email is already registered as a seller..."
5. Registration blocked
```

---

## Setup Instructions

### For Fresh Installations

No special setup needed! The single-role enforcement is built-in.

### For Existing Databases

**IMPORTANT**: Run the cleanup script to remove duplicate roles:

```bash
# 1. Navigate to server directory
cd E:\Learn-Typescript\DeshGhuri\apps\server

# 2. Run cleanup script
bun run scripts/cleanup-duplicate-roles.ts

# 3. Verify output shows no remaining duplicates
```

**What the script does**:

- Identifies users with multiple roles
- Keeps the highest priority role per user
- Deletes all duplicate role entries
- Confirms database is clean

**Role Priority**:

1. super_admin (highest)
2. admin
3. seller
4. customer (lowest)

**Example**: If a user has both "admin" and "customer" roles, the script keeps "admin" and deletes "customer".

---

## Testing

### Test 1: Email Uniqueness Across Roles

```bash
# 1. Create a customer account
Email: test@example.com
Role: Customer
✅ Success

# 2. Try to create seller with same email
Email: test@example.com
Role: Seller
❌ Error: "Email already registered"
```

### Test 2: Database Cleanup

```bash
# 1. Check for users with multiple roles
SELECT u.email, COUNT(ur.role) as role_count
FROM "user" u
JOIN "user_role" ur ON u.id = ur.user_id
GROUP BY u.email
HAVING COUNT(ur.role) > 1;

# 2. Run cleanup script
bun run scripts/cleanup-duplicate-roles.ts

# 3. Verify no users have multiple roles
# (Run query again, should return 0 rows)
```

### Test 3: No Role Switcher in UI

```bash
# 1. Sign in as admin
# 2. Check navbar/header
❌ Should NOT see role switcher
✅ Only see logout button

# 3. Sign in as seller
# 4. Check dashboard header
❌ Should NOT see role switcher
✅ Only see business name and logout
```

---

## Database Schema

### User Role Table

```sql
CREATE TABLE "user_role" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "role" TEXT NOT NULL,  -- 'customer' | 'seller' | 'admin' | 'super_admin'
  "created_at" TIMESTAMP DEFAULT NOW(),
  "created_by" TEXT REFERENCES "user"(id)
);

-- CONSTRAINT: Each user should have EXACTLY ONE role
-- Enforced by application logic + cleanup script
```

### Uniqueness Rules

1. **Email in User Table**:
   - Used for: customers, admins, super_admins
   - Must be unique across all users

2. **Email in Seller Table**:
   - Used for: sellers
   - Must be unique across all sellers

3. **Cross-Table Check**:
   - Before creating user → check seller table
   - Before creating seller → check user table
   - Prevents email reuse

---

## Files Modified

### Frontend

1. **`apps/web/src/components/layout/navbar.tsx`**
   - Removed RoleSwitcher import and usage

2. **`apps/web/src/components/admin/admin-layout.tsx`**
   - Removed RoleSwitcher import and usage

3. **`apps/web/src/components/seller/dashboard-layout.tsx`**
   - Removed RoleSwitcher import and usage (2 places)

### Backend

1. **`apps/server/src/routes/auth/check-email.ts`**
   - Enhanced to check both user and seller tables
   - Updated error messages for clarity

2. **`apps/server/src/scripts/cleanup-duplicate-roles.ts`** (NEW)
   - Database cleanup script
   - Removes duplicate roles
   - Keeps highest priority role

### Documentation

1. **`SINGLE_ROLE_ENFORCEMENT.md`** (THIS FILE)
   - Complete implementation guide
   - Setup instructions
   - Testing procedures

---

## Migration Guide for Existing Users

If you have an existing database with multi-role users:

### Step 1: Backup Database

```bash
pg_dump -U postgres -d deshghuri > backup_before_cleanup.sql
```

### Step 2: Run Cleanup Script

```bash
cd apps/server
bun run scripts/cleanup-duplicate-roles.ts
```

### Step 3: Verify Results

```sql
-- Check no users have multiple roles
SELECT user_id, COUNT(*) as role_count
FROM "user_role"
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Should return 0 rows
```

### Step 4: Update Application

```bash
git pull origin seller-dashboard-analytics
bun install
bun run dev
```

### Step 5: Test

1. Try signing in with various accounts
2. Verify no role switcher appears
3. Try registering with existing emails (should fail)

---

## Troubleshooting

### Issue: Users with multiple roles still exist

**Solution**:

```bash
# Run cleanup script again
cd apps/server
bun run scripts/cleanup-duplicate-roles.ts

# Manually check database
# If script fails, contact support
```

### Issue: Can't register new accounts

**Symptom**: "Email already registered" for new emails

**Solution**:

```sql
-- Check if email truly exists
SELECT * FROM "user" WHERE email = 'newuser@example.com';
SELECT * FROM "seller" WHERE email = 'newuser@example.com';

-- If no results, check application logs for errors
```

### Issue: Lost admin access

**Symptom**: Admin account downgraded to customer

**Solution**:

```sql
-- Check current role
SELECT u.email, ur.role
FROM "user" u
JOIN "user_role" ur ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';

-- If role is wrong, update it
UPDATE "user_role"
SET role = 'admin'
WHERE user_id = (SELECT id FROM "user" WHERE email = 'admin@example.com');
```

---

## Benefits of Single-Role System

1. **Simplicity**: No confusion about which role is active
2. **Security**: Clear separation of concerns
3. **UX**: Users know exactly what their account type is
4. **Data Integrity**: One user = one role = clean database
5. **Easier Debugging**: No role-switching edge cases

---

## Important Notes

1. **No Backwards Compatibility**: Multi-role support is completely removed
2. **Run Cleanup Script**: Required for existing databases
3. **Email Locked**: Once used for one role, email cannot be reused
4. **Contact Support**: If users need to change roles, they must contact support to:
   - Delete old account
   - Create new account with desired role
   - (Or support can manually change role in database)

---

## Questions & Answers

**Q: What if someone needs to be both a customer and seller?**
A: They must use two different email addresses - one for each role.

**Q: Can admins browse as customers?**
A: No. Admin accounts are separate. Create a customer account with different email.

**Q: What happens to existing multi-role users?**
A: Run cleanup script - it keeps highest priority role and removes others.

**Q: Can I switch an account's role?**
A: Not through the UI. Database admin can manually update the role in `user_role` table.

**Q: Is this reversible?**
A: The code changes are reversible, but you'd need to manually restore multiple roles to affected users.

---

**Last Updated**: 2026-02-08
**Branch**: `seller-dashboard-analytics`
