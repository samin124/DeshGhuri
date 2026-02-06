# DeshGhuri - Project Context for AI Assistance

This file helps AI assistants (like Claude) understand the project structure and make better suggestions.

---

## Project Overview

**DeshGhuri** is a trusted travel marketplace platform for Bangladesh with:
- Escrow-protected payments
- Multi-role authentication (Customer, Seller, Admin)
- Group booking discounts
- Verified seller system
- Real-time booking management

**Tech Stack:**
- **Frontend**: React + TanStack Router + TanStack Query
- **Backend**: Hono (Node.js) + Better Auth
- **Database**: PostgreSQL (Drizzle ORM)
- **Storage**: Supabase Storage (S3)
- **Monorepo**: Turborepo + Bun

---

## Architecture

### Frontend (`/apps/web`)
- **Router**: TanStack Router with file-based routing
- **State**: TanStack Query for server state
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Better Auth client

### Backend (`/apps/server`)
- **Framework**: Hono with RPC endpoints
- **Auth**: Better Auth with custom seller authentication
- **Database**: Drizzle ORM with PostgreSQL
- **Storage**: Supabase for file uploads

### Packages
- `/packages/auth` - Authentication logic (Better Auth + custom seller auth)
- `/packages/db` - Database schema and migrations
- `/packages/ui` - Shared UI components (future)

---

## Authentication System

### Multi-Role Architecture

Users can have multiple roles simultaneously:
- **Customer** - Browse and book experiences
- **Seller** - Manage listings and bookings
- **Admin/Super Admin** - Platform management

### Key Patterns

1. **Unified Authentication**
   - Single Better Auth session for all roles
   - Role-based redirects after login
   - Sellers have additional seller-specific session

2. **Role Switcher**
   - Component: `/apps/web/src/components/layout/role-switcher.tsx`
   - Shows in navbar for multi-role users
   - Allows switching between contexts without re-login

3. **Route Protection**
   - Admin routes: `/apps/web/src/routes/admin/_admin.tsx`
   - Seller routes: `/apps/web/src/routes/seller/dashboard.tsx`
   - Both check roles via `/api/auth/roles` endpoint

4. **Logout Behavior**
   - Logging out from any dashboard = complete logout
   - Security-first approach (industry standard)
   - Use RoleSwitcher to switch contexts, not logout

---

## Important Files

### Authentication
- `/apps/server/src/routes/auth/roles.ts` - Roles API endpoint
- `/apps/web/src/lib/auth/redirect-after-login.ts` - Smart redirect logic
- `/packages/auth/src/seller-auth.ts` - Seller auth implementation

### Layouts
- `/apps/web/src/components/admin/admin-layout.tsx` - Admin dashboard layout
- `/apps/web/src/components/seller/dashboard-layout.tsx` - Seller dashboard layout
- `/apps/web/src/components/layout/navbar.tsx` - Public navbar
- `/apps/web/src/components/layout/dashboard-footer.tsx` - Dashboard footer

### Route Guards
- `/apps/web/src/routes/admin/_admin.tsx` - Admin protection
- `/apps/web/src/routes/seller/dashboard.tsx` - Seller protection

---

## Key Conventions

### 1. **Never Hide Customer Features**
The navbar should ALWAYS show customer features (search, categories, deals, cart, wishlist) on public pages, regardless of user roles.

### 2. **Route Protection Pattern**
```typescript
beforeLoad: async ({ location }) => {
  const session = await getUser();
  if (!session) {
    throw redirect({ to: '/login', search: { return: location.pathname } });
  }

  // Verify role
  const { roles } = await fetch('/api/auth/roles').then(r => r.json());
  if (!roles.includes('required_role')) {
    throw redirect({ to: '/' });
  }
}
```

### 3. **Dashboard Headers**
All dashboards should have:
- Badge showing context ("Admin Panel" / "Seller Dashboard")
- RoleSwitcher next to badge
- Logout button on the right

### 4. **Dropdown Menus (BaseUI/shadcn)**
**CRITICAL**: `DropdownMenuLabel` MUST be wrapped in `DropdownMenuGroup`:
```typescript
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>Label Text</DropdownMenuLabel>
  </DropdownMenuGroup>
  <DropdownMenuSeparator />
  {/* Menu items NOT in group */}
</DropdownMenuContent>
```

### 5. **Password Hashing**
- Customer/Admin: Better Auth (auto-handled)
- Seller: Custom Argon2 implementation in `/packages/auth/src/seller-auth.ts`

---

## Common Tasks

### Add a new protected route
1. Create route file in `/apps/web/src/routes/`
2. Add `beforeLoad` with role check
3. Redirect to login if not authenticated
4. Redirect to home if wrong role

### Add a new API endpoint
1. Create route in `/apps/server/src/routes/`
2. Use `requireAdmin` or `requireSeller` middleware if needed
3. Export via `/apps/server/src/index.ts`

### Add UI components
1. Use shadcn/ui: `npx shadcn@latest add <component>`
2. Components go in `/apps/web/src/components/ui/`
3. Customize as needed

---

## Database

### Schema
- Located in `/packages/db/src/schema/`
- Main tables: `user`, `seller`, `listing`, `booking`, `review`

### Migrations
```bash
cd packages/db
bun run db:generate  # Generate migration
bun run db:migrate   # Apply migration
```

---

## Development

### Run the project
```bash
bun install          # Install dependencies
bun run dev          # Start all apps (web + server)
```

### Useful commands
```bash
bun run dev:web      # Frontend only
bun run dev:server   # Backend only
bun run check-types  # Type checking
```

---

## Security Notes

1. **Never skip role verification** on protected routes
2. **Backend always enforces permissions** - frontend checks are UX only
3. **Session cookies** are httpOnly and secure
4. **File uploads** go through Supabase (not filesystem)
5. **Environment variables** are in `.env` (never commit!)

---

## Known Issues

1. Dashboard UI components (scroll-area, sheet, table) need to be installed via shadcn
2. Some routes in navbar (terms, privacy, help) don't exist yet - just type errors, no runtime issue

---

## Docs to Reference

- `/docs/prd.md` - Product requirements
- `/docs/IMPLEMENTATION_COMPLETE.md` - Auth/RBAC implementation details
- `/docs/SELLER_DASHBOARD_QUICKSTART.md` - Seller feature guide
- `/docs/ARCHITECTURE.md` - Detailed system design

---

**Last Updated**: 2026-02-06
**Current Branch**: `seller-dashboard-analytics`
