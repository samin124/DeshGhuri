# Admin System Documentation

## Overview

The DeshGhuri admin system provides a secure, professional admin panel for managing the marketplace platform. Admins have completely separate login flow from regular users and sellers.

## Features

✅ **Dedicated Admin Login** - Professional login page at `/admin`
✅ **Role-Based Access Control** - Supports both `admin` and `super_admin` roles
✅ **Secure Authentication** - Backend middleware protection on all admin routes
✅ **Modern UI** - Dark theme with professional design
✅ **Security Monitoring** - All login attempts are logged

---

## Admin Login Flow

### 1. How Admin Accesses the Panel

**URL**: `http://localhost:3001/admin`

**Flow**:

1. Admin visits `/admin`
2. If already logged in as admin → Redirects to `/admin/dashboard`
3. If not logged in → Shows professional admin login page
4. Admin enters credentials (same email/password as their user account)
5. System verifies credentials via Better Auth
6. System checks if user has `admin` or `super_admin` role
7. If admin role confirmed → Redirects to `/admin/dashboard`
8. If no admin role → Signs them out and shows error message

### 2. Design Features

- **Dark Theme**: Professional dark gradient background
- **Security Badge**: "Restricted Area - Authorized Personnel Only"
- **Shield Icon**: Visual indicator of secure admin area
- **Custom Styling**: Distinct from regular user login
- **Monitoring Notice**: Users informed that login attempts are logged

### 3. Access Control

**Backend Protection** (Primary):

- All `/api/admin/*` routes protected by `requireAdmin` middleware
- Middleware checks for `admin` or `super_admin` role
- Returns 403 Forbidden if user lacks admin role

**Frontend Protection**:

- `/admin/index.tsx` verifies admin role after login
- `/admin/_admin.tsx` route guard checks authentication
- Non-admin users cannot access admin dashboard

---

## Creating Admin Accounts

### Method 1: TypeScript Script (Recommended)

1. **First, create a regular user account**:
   - Go to `http://localhost:3001/login`
   - Sign up with email and password

2. **Edit the script**:

   ```typescript
   // In create-admin.ts
   const EMAIL_TO_PROMOTE = 'admin@example.com'; // Your email here
   const ROLE_TYPE = 'admin'; // or 'super_admin'
   ```

3. **Run the script**:

   ```bash
   bun run create-admin.ts
   ```

4. **Login at admin panel**:
   - Go to `http://localhost:3001/admin`
   - Use your existing email and password

### Method 2: Direct SQL

1. **Find your user ID**:

   ```sql
   SELECT id, email, name FROM "user" WHERE email = 'your-email@example.com';
   ```

2. **Grant admin role**:

   ```sql
   INSERT INTO user_role (id, user_id, role, created_at)
   VALUES (
     'role_' || substr(md5(random()::text), 1, 16),
     'user_xxxxx',  -- Replace with your user ID
     'admin',       -- or 'super_admin'
     NOW()
   );
   ```

3. **Verify**:
   ```sql
   SELECT u.email, ur.role
   FROM "user" u
   JOIN user_role ur ON ur.user_id = u.id
   WHERE u.id = 'user_xxxxx';
   ```

See `create-admin.sql` for complete SQL script with all commands.

---

## Admin Roles

### `admin`

- Full access to admin panel
- Can manage users, sellers, listings, bookings, etc.
- Cannot manage other admins

### `super_admin`

- All permissions of `admin`
- Can manage other admin users
- Additional system-level permissions

---

## Available Admin Routes

Once logged in, admins can access:

| Route                               | Description                         |
| ----------------------------------- | ----------------------------------- |
| `/admin/dashboard`                  | Overview with key metrics and stats |
| `/admin/users`                      | User management                     |
| `/admin/sellers`                    | Seller management                   |
| `/admin/sellers/verification-queue` | Review pending seller applications  |
| `/admin/bookings`                   | Booking management                  |
| `/admin/listings`                   | Listing management                  |
| `/admin/transactions`               | Transaction monitoring              |
| `/admin/content`                    | Content management                  |
| `/admin/promotions`                 | Promotional campaigns               |
| `/admin/reports`                    | Analytics and reports               |
| `/admin/documents`                  | Document review                     |
| `/admin/audit-logs`                 | System audit logs                   |

---

## Security Features

### 1. Multi-Layer Protection

**Backend**:

- `requireAdmin` middleware on all admin routes
- Session validation via Better Auth
- Role verification against database

**Frontend**:

- Route guards check authentication
- Admin role verified during login
- Automatic sign-out if role missing

### 2. Session Management

- Admins use same Better Auth sessions as regular users
- Role checked on every protected API request
- Sessions expire based on Better Auth configuration

### 3. Audit Trail

- Login attempts logged (future enhancement)
- Admin actions trackable via audit logs table
- Security notice displayed on login page

---

## Architecture

### File Structure

```
apps/
├── server/src/
│   ├── middleware/
│   │   └── admin-auth.ts          # requireAdmin middleware
│   ├── routes/admin/
│   │   ├── verify.ts              # Admin role verification endpoint
│   │   ├── dashboard.ts           # Dashboard stats
│   │   ├── users.ts               # User management
│   │   ├── sellers.ts             # Seller management
│   │   └── ...                    # Other admin routes
│   └── index.ts                   # Route registration
│
├── web/src/
│   ├── routes/admin/
│   │   ├── index.tsx              # Admin login page
│   │   ├── _admin.tsx             # Admin layout route guard
│   │   └── _admin/
│   │       ├── dashboard.tsx      # Dashboard page
│   │       └── ...                # Other admin pages
│   └── components/admin/
│       └── admin-layout.tsx       # Admin sidebar & header
│
└── docs/
    └── ADMIN_SYSTEM.md            # This file
```

### Authentication Flow

```
User visits /admin
       ↓
[Already logged in?]
   ↓         ↓
  No        Yes
   ↓         ↓
Show       [Has admin role?]
Login          ↓         ↓
Form          No        Yes
   ↓           ↓         ↓
Login     403 Error   Dashboard
Success
   ↓
[Verify admin role]
   ↓         ↓
  No        Yes
   ↓         ↓
Sign out   Dashboard
+ Error
```

### Backend API Routes

```
/api/admin/verify                 # Check admin role (no auth required)
    ↓
/api/admin/*                      # All other admin routes
    ↓
[requireAdmin middleware]
    ↓
- Validate session
- Check user role
- Allow/deny access
```

---

## Troubleshooting

### Issue: "Access Denied" after login

**Cause**: User account doesn't have admin role
**Solution**: Run `create-admin.ts` or manually add role via SQL

### Issue: Can access admin UI but API calls fail

**Cause**: Backend middleware blocking requests (working as intended)
**Solution**: Ensure user has proper admin role in database

### Issue: Redirected to /admin after login to admin panel

**Cause**: Admin role verification failed
**Solution**: Check database for user_role entry with 'admin' or 'super_admin'

### Issue: Cannot find user to promote

**Cause**: User hasn't signed up yet
**Solution**: First create account via `/login`, then run admin creation script

---

## Development Notes

### Adding New Admin Routes

1. **Create route file**:

   ```typescript
   // apps/server/src/routes/admin/my-feature.ts
   import { Hono } from 'hono';

   const app = new Hono();

   app.get('/stats', async (c) => {
     // Your logic here
     return c.json({ data: [] });
   });

   export default app;
   ```

2. **Register route**:

   ```typescript
   // apps/server/src/index.ts
   import myFeature from './routes/admin/my-feature';

   // After requireAdmin middleware
   app.route('/api/admin/my-feature', myFeature);
   ```

3. **Create frontend page**:

   ```typescript
   // apps/web/src/routes/admin/_admin/my-feature.tsx
   import { createFileRoute } from '@tanstack/react-router';

   export const Route = createFileRoute('/admin/_admin/my-feature')({
     component: MyFeaturePage,
   });

   function MyFeaturePage() {
     return <div>My Feature</div>;
   }
   ```

4. **Add to navigation** (optional):
   ```typescript
   // apps/web/src/components/admin/admin-layout.tsx
   const navigation = [
     // ... existing items
     {
       name: 'My Feature',
       href: '/admin/my-feature',
       icon: YourIcon,
     },
   ];
   ```

### Testing Admin Access

```bash
# 1. Start servers
bun run dev

# 2. Create regular user account
# Visit: http://localhost:3001/login

# 3. Promote to admin
bun run create-admin.ts

# 4. Login as admin
# Visit: http://localhost:3001/admin
```

---

## Related Documentation

- `BECOME_SELLER_IMPLEMENTATION.md` - Seller authentication system
- `SELLER_DASHBOARD_QUICKSTART.md` - Seller dashboard guide
- `MEMORY.md` - Project memory with implementation notes

---

## Future Enhancements

- [ ] Two-factor authentication for admin accounts
- [ ] IP whitelisting for admin access
- [ ] Detailed audit logging of admin actions
- [ ] Admin activity dashboard
- [ ] Role-based permissions (granular access control)
- [ ] Admin invitation system (email-based)
- [ ] Session timeout warnings
- [ ] Admin-specific email notifications

---

**Last Updated**: 2026-02-06
**Author**: DeshGhuri Development Team
