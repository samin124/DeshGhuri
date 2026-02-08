# Quick Reference - DeshGhuri

Quick access to common commands and important information.

---

## 🚀 Starting the Application

### Option 1: Fresh Start (Recommended)
```bash
# Double-click or run:
.\scripts\fresh-start.bat

# This will:
# 1. Kill all ports
# 2. Wait 10 seconds
# 3. Start both servers
```

### Option 2: Manual Start
```bash
# From project root:
bun run dev

# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

---

## 🔧 Port Management

### Kill All Ports
```bash
.\scripts\kill-ports.bat
```

### Diagnose Port Issues
```bash
.\scripts\diagnose-ports.bat
```

### Check What's Running
```bash
# Check backend
curl http://localhost:3000/api/auth/roles

# Check frontend
# Browser: http://localhost:3001
```

---

## 🗄️ Database Management

### Run Cleanup Script (ONE TIME - Required!)
```bash
cd apps\server
bun run scripts\cleanup-duplicate-roles.ts
```

### Check Database
```bash
cd packages\db
bun run db:studio
```

### Verify No Duplicate Roles
```sql
SELECT user_id, COUNT(*) as role_count
FROM "user_role"
GROUP BY user_id
HAVING COUNT(*) > 1;
```

---

## 🧪 Testing Authentication

### Test Login Page
1. Navigate to: `http://localhost:3001/login`
2. Check tabs: Sign In | Sign Up | Become a Seller

### Test Email Uniqueness
```bash
# Backend must be running
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

### Test Role-Based Redirects
- Admin login → `/admin/dashboard`
- Seller login → `/seller/dashboard`
- Customer login → Home page

---

## 📋 Key Changes

### Removed
- ❌ Separate seller login page (`/seller/signin`)
- ❌ RoleSwitcher component (from all layouts)
- ❌ Multi-role capability

### Added
- ✅ Tabbed login interface
- ✅ Email uniqueness validation
- ✅ Single-role enforcement
- ✅ Database cleanup script
- ✅ Port management tools

---

## 📁 Important Files

### Documentation
- `SESSION_STATUS.md` - Current status and next steps
- `COMPLETE_CHANGES_SUMMARY.md` - All changes overview
- `AUTHENTICATION_UPDATES.md` - Auth system details
- `SINGLE_ROLE_ENFORCEMENT.md` - Role system details

### Scripts
- `scripts/fresh-start.bat` - Clean server start
- `scripts/kill-ports.bat` - Kill development ports
- `scripts/diagnose-ports.bat` - Port diagnostics
- `apps/server/src/scripts/cleanup-duplicate-roles.ts` - Database cleanup

### Modified Components
- `apps/web/src/routes/login.tsx` - Tabbed login
- `apps/web/src/components/sign-in-form.tsx` - Role detection
- `apps/web/src/components/layout/navbar.tsx` - No RoleSwitcher
- `apps/server/src/routes/auth/check-email.ts` - Email validation

---

## ⚡ Troubleshooting

### Port 3000/3001 in use
```bash
# Solution 1: Wait 2-5 minutes
# Solution 2: Restart computer
# Solution 3: Run fresh-start.bat
```

### Backend won't connect
```bash
# Check .env file exists
# Verify DATABASE_URL is correct
# Run: bun run dev:server
```

### Frontend shows errors
```bash
# Clear browser cache
# Check backend is running
# Restart frontend: bun run dev:web
```

### Email validation not working
```bash
# Verify backend is running on port 3000
# Check /api/auth/check-email endpoint
# Review browser console for errors
```

---

## 🎯 Action Checklist

Before using the application:

1. [ ] Run database cleanup script
   ```bash
   cd apps\server
   bun run scripts\cleanup-duplicate-roles.ts
   ```

2. [ ] Start development servers
   ```bash
   .\scripts\fresh-start.bat
   ```

3. [ ] Test login page tabs
   - Navigate to http://localhost:3001/login
   - Verify 3 tabs visible

4. [ ] Test email uniqueness
   - Create account with email
   - Try same email again
   - Should see error

5. [ ] Verify no role switcher
   - Sign in as any role
   - Check navbar/header
   - Should only see logout

---

## 📞 Need Help?

1. **Check SESSION_STATUS.md** for current status
2. **Run diagnose-ports.bat** for port issues
3. **Review error logs** in terminal output
4. **Check database connection** in .env file

---

## 🔑 Key URLs

- Login: `http://localhost:3001/login`
- Admin Dashboard: `http://localhost:3001/admin/dashboard`
- Seller Dashboard: `http://localhost:3001/seller/dashboard`
- Backend API: `http://localhost:3000`
- Check Email: `http://localhost:3000/api/auth/check-email`

---

**Last Updated**: 2026-02-08
**Branch**: seller-dashboard-analytics
**Status**: ✅ All code changes complete
