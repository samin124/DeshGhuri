# 🚀 Quick Start Guide

## Current Status: ✅ ALL WORKING

Your DeshGhuri project is fully set up and running!

---

## 🎯 What's Working Right Now

### ✅ Admin Access

**Login:** http://localhost:3001/login

```
Email: admin@deshghuri.com
Password: Admin@123456
```

**Admin Panel:** http://localhost:3001/admin

### ✅ User Authentication

- Sign Up: http://localhost:3001/login (click "Need an account?")
- Sign In: http://localhost:3001/login
- Email verification emails working

### ✅ Seller Registration

- Landing: http://localhost:3001/seller
- Signup: http://localhost:3001/seller/signup
- **Document uploads available in Step 2 of registration**

### ✅ Development Servers

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs
- **Supabase Studio:** http://127.0.0.1:54323
- **Email Testing:** http://127.0.0.1:54324

---

## ⚠️ One More Thing: Google OAuth

To enable "Sign in with Google", add these redirect URIs to your [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

**Note:** Configure your Google OAuth Client ID in the Google Cloud Console and add it to your `.env` file.

---

## 📊 Database

### Tables Created (19)

All authentication and business tables are created and ready:

- user, account, session, verification (Better Auth)
- user_role (RBAC)
- seller, seller_document, seller_bank_account, seller_payment_method
- listing, listing_analytics
- booking, review, proof_of_completion
- escrow_transaction, payout
- audit_log, verification_timeline

### Storage Buckets (3)

- `seller-documents` (private, 10MB)
- `listings` (public, 5MB)
- `avatars` (public, 2MB)

**View in:** http://127.0.0.1:54323/project/default/editor

---

## 🛠️ Useful Commands

```bash
# Start everything (if stopped)
bun run dev

# Check Supabase status
supabase status

# View database in browser
open http://127.0.0.1:54323

# View test emails
open http://127.0.0.1:54324

# Create another admin (if needed)
cd apps/server && bun run src/scripts/create-admin.ts

# Reset database (careful!)
supabase db reset
bun run db:migrate
```

---

## 🧪 Test Features

### Test Admin Access

1. Go to http://localhost:3001/login
2. Login with admin credentials (above)
3. Access http://localhost:3001/admin
4. See dashboard stats

### Test User Registration

1. Go to http://localhost:3001/login
2. Click "Need an account? Sign Up"
3. Fill form with new email/password
4. Check email at http://127.0.0.1:54324
5. Verify email (optional, can login without verification)

### Test Seller Registration

1. Go to http://localhost:3001/seller
2. Click "Sign Up as Seller"
3. **Step 1:** Enter email/password
4. **Step 2:** Fill business info + **upload ALL required documents**
5. Submit for admin approval

### Test Role Switching

1. Login as admin (has admin + customer roles)
2. See "Customer View" / "Admin Panel" switcher in navbar
3. Click to switch between dashboards

---

## 📚 Documentation

- **Technical Details:** `AUTHENTICATION_FIX_SUMMARY.md`
- **Project Context:** `CLAUDE.md`
- **Setup Guide:** `docs/LOCAL_SUPABASE_SETUP.md`
- **PRD:** `docs/prd.md`

---

## 🎉 Everything Fixed!

### Issues Resolved:

- ✅ CORS blocking all requests → Fixed
- ✅ Better Auth origin mismatch → Fixed
- ✅ No admin account → Created with proper password hash
- ✅ Sign up not working → Working perfectly
- ✅ Sign in not working → Working perfectly
- ✅ Storage buckets missing → Created all 3
- ✅ Database tables missing → All 19 tables created

### What You Have Now:

- ✅ Fully functional authentication system
- ✅ Admin panel with dashboard
- ✅ User registration with email verification
- ✅ Seller registration with document uploads
- ✅ Role-based access control (RBAC)
- ✅ Multi-role support
- ✅ Session management
- ✅ Secure password hashing

### Google OAuth Status:

⚠️ Needs redirect URI configuration (5 minutes)

---

## 💡 Tips

1. **Emails don't actually send** - they appear in Mailpit: http://127.0.0.1:54324
2. **Database changes** - Use Supabase Studio to view/edit data
3. **Session issues** - Clear browser cookies and re-login
4. **Role switcher** - Only shows for users with multiple roles
5. **Admin credentials** - Save them somewhere safe!

---

**Status:** 🟢 All systems operational
**Dev Server:** 🟢 Running on ports 3000 & 3001
**Supabase:** 🟢 Running locally
**Last Updated:** 2026-02-06
