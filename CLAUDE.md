# Working on DeshGhuri with Claude

This guide helps developers use Claude AI to effectively work on the DeshGhuri project. It contains essential context, patterns, and workflows that Claude needs to assist you productively.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Key Patterns & Conventions](#key-patterns--conventions)
- [Common Tasks](#common-tasks)
- [Database Schema](#database-schema)
- [Important Context](#important-context)
- [File Locations](#file-locations)
- [Additional Documentation](#additional-documentation)

---

## 🎯 Project Overview

**DeshGhuri** is a travel and tourism platform for Bangladesh, connecting travelers with verified sellers (agencies, hotels, and tour operators).

### Core Features
- **User Authentication**: Email/password and Google OAuth via Better Auth
- **Seller Onboarding**: Multi-step verification process with document upload
- **Admin Panel**: Complete management system for users, sellers, and documents
- **File Storage**: Supabase Storage for document management
- **Email System**: Resend integration for notifications

### User Roles
- `customer` - Regular users browsing and booking
- `seller` - Verified businesses offering services
- `admin` - Platform administrators
- `super_admin` - Root administrators with full access

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Bun (JavaScript runtime)
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL via Supabase (local development)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Email**: Resend API
- **Storage**: Supabase Storage (S3-compatible)
- **API Docs**: OpenAPI with Scalar UI

### Frontend
- **Framework**: React 19 with TanStack Router
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query
- **Forms**: TanStack Form
- **UI Components**: Radix UI + shadcn/ui patterns
- **Build Tool**: Vite

### Database & Infrastructure
- **Database**: PostgreSQL 17
- **Migrations**: Drizzle Kit
- **Local Dev**: Supabase CLI (Docker containers)
- **Monorepo**: Bun workspaces

---

## 🏗 Architecture

### Monorepo Structure

```
DeshGhuri/
├── apps/
│   ├── server/          # Backend API (Hono)
│   └── web/             # Frontend (React + TanStack Router)
├── packages/
│   ├── auth/            # Better Auth configuration
│   ├── db/              # Database schema & migrations
│   ├── env/             # Environment validation (Zod)
│   └── config/          # Shared TypeScript config
├── supabase/            # Local Supabase configuration
└── docs/                # Project documentation
```

### Key Directories

#### Backend (`apps/server/src/`)
```
src/
├── routes/              # API route handlers
│   ├── admin/          # Admin panel APIs
│   ├── seller.ts       # Seller onboarding
│   └── seller-uploads.ts # Document uploads
├── middleware/
│   └── admin-auth.ts   # Admin authorization
├── lib/
│   ├── storage.ts      # Supabase Storage client
│   ├── email/          # Email service & templates
│   └── audit-log.ts    # Audit logging utilities
└── index.ts            # Server entry point
```

#### Frontend (`apps/web/src/`)
```
src/
├── routes/             # File-based routing
│   ├── admin/         # Admin panel pages
│   ├── seller/        # Seller pages
│   └── __root.tsx     # Root layout
├── components/
│   ├── admin/         # Admin-specific components
│   ├── common/        # Shared components
│   └── ui/            # Base UI components
├── lib/
│   └── api/           # API client functions
└── hooks/             # Custom React hooks
```

#### Database (`packages/db/src/`)
```
src/
├── schema/
│   ├── auth.ts        # Users, sessions, roles
│   ├── seller.ts      # Sellers, documents, bank accounts
│   └── admin.ts       # Audit logs
├── migrations/        # Auto-generated SQL migrations
├── index.ts           # Drizzle client export
├── seed-roles.ts      # Seed initial roles
└── make-admin.ts      # Script to create admin users
```

---

## 🚀 Development Setup

### Prerequisites
- **Bun**: v1.3.6+ (runtime & package manager)
- **Docker**: For local Supabase instance
- **PostgreSQL**: Runs via Supabase Docker containers

### Initial Setup

```bash
# 1. Install dependencies
bun install

# 2. Start Supabase (local PostgreSQL + Storage)
cd supabase
supabase start  # If you have Supabase CLI
# OR use Docker Compose if configured

# 3. Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files with your local configuration
# See docs/MIGRATION_SUMMARY.md for Supabase Storage config

# 4. Push database schema
bun run db:push

# 5. Seed initial data
cd packages/db
bun run db:seed-roles

# 6. Create an admin user
bun run db:make-admin your-email@example.com
```

### Development Commands

```bash
# Start all services (server + web)
bun run dev

# Start individual services
bun run dev:server   # Backend only (port 3000)
bun run dev:web      # Frontend only (port 3001)

# Database operations
bun run db:studio    # Drizzle Studio (DB GUI)
bun run db:generate  # Generate migrations
bun run db:push      # Push schema changes

# Type checking
bun run check-types
```

### Environment Variables

#### Server (apps/server/.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Auth
BETTER_AUTH_SECRET=<generate-32-char-secret>
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-password>
EMAIL_FROM=your-email@gmail.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Supabase Storage
SUPABASE_PROJECT_REF=DeshGhuri
SUPABASE_SERVICE_ROLE_KEY=<generate-from-supabase>
SUPABASE_STORAGE_BUCKET=seller-documents
```

#### Web (apps/web/.env)
```bash
VITE_SERVER_URL=http://localhost:3000
```

---

## 📐 Key Patterns & Conventions

### Code Style

1. **TypeScript**: Strict mode enabled
2. **File Naming**: kebab-case for files, PascalCase for components
3. **Imports**: Use workspace aliases (`@DeshGhuri/db`, `@DeshGhuri/auth`)
4. **Error Handling**: Always wrap async operations in try-catch
5. **Validation**: Use Zod for all input validation

### Backend Patterns

#### Route Structure (Hono)
```typescript
import { Hono } from 'hono';
import { db, user, eq } from '@DeshGhuri/db';

const app = new Hono();

app.get('/users/:id', async (c) => {
  const userId = c.req.param('id');

  const result = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: result });
});

export default app;
```

#### Database Queries (Drizzle)
```typescript
// Import from @DeshGhuri/db
import { db, user, seller, eq, and, desc } from '@DeshGhuri/db';

// Query with relations
const sellerWithDocs = await db.query.seller.findFirst({
  where: eq(seller.id, sellerId),
  with: {
    documents: true,
    bankAccount: true,
    timeline: {
      orderBy: [desc(verificationTimeline.createdAt)],
    },
  },
});

// Insert
await db.insert(user).values({
  id: generateId('usr'),
  email: 'user@example.com',
  name: 'John Doe',
});

// Update
await db.update(user)
  .set({ emailVerified: true })
  .where(eq(user.id, userId));

// Delete
await db.delete(user).where(eq(user.id, userId));
```

#### ID Generation
```typescript
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

// Examples:
generateId('usr')  // usr_abc123def456...
generateId('sel')  // sel_xyz789ghi012...
generateId('doc')  // doc_mno345pqr678...
```

#### Audit Logging
```typescript
import { logAudit } from '../lib/audit-log';

// Always log admin actions
await logAudit({
  action: 'user.suspend',
  entityType: 'user',
  entityId: userId,
  performedBy: adminUserId,
  metadata: {
    ip: c.req.header('x-forwarded-for') || 'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
  },
  before: { emailVerified: true, suspended: false },
  after: { emailVerified: true, suspended: true },
});
```

### Frontend Patterns

#### Route File Structure (TanStack Router)
```typescript
// apps/web/src/routes/admin/_admin/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getUserById } from '@/lib/api/admin';

export const Route = createFileRoute('/admin/_admin/users/$userId')({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>User not found</div>;

  return <div>{/* User details */}</div>;
}
```

#### API Client Functions
```typescript
// apps/web/src/lib/api/admin.ts
const API_URL = import.meta.env.VITE_SERVER_URL;

export async function getUserById(userId: string) {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    credentials: 'include', // Important for auth cookies
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}
```

#### Form Handling (TanStack Form)
```typescript
import { useForm } from '@tanstack/react-form';

const form = useForm({
  defaultValues: {
    email: '',
    name: '',
  },
  onSubmit: async ({ value }) => {
    await createUser(value);
  },
});
```

---

## 🗄 Database Schema

### Core Tables

#### `user` - User accounts
```typescript
{
  id: string;              // Primary key
  email: string;           // Unique
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `user_role` - Role assignments
```typescript
{
  id: string;
  userId: string;          // FK to user
  role: 'customer' | 'seller' | 'admin' | 'super_admin';
  createdAt: Date;
  createdBy: string | null;
}
```

#### `seller` - Seller businesses
```typescript
{
  id: string;
  userId: string;          // FK to user
  businessName: string;
  category: 'agency' | 'hotel' | 'tour-operator';
  registrationNumber: string;
  address: JSON;           // {street, city, district, postalCode?}
  contactPhone: string;
  contactEmail: string;
  verificationStatus: 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete';
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `seller_document` - Uploaded documents
```typescript
{
  id: string;
  sellerId: string;        // FK to seller
  documentType: 'trade-license' | 'nid' | 'passport' | 'tin-certificate' | 'property-docs' | 'tour-license';
  fileName: string;
  fileUrl: string;         // Signed URL from Supabase Storage
  fileSize: number;
  storageKey: string;      // Path in Supabase Storage bucket
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  uploadedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;  // FK to user (admin)
}
```

#### `audit_log` - Admin action tracking
```typescript
{
  id: string;
  action: string;          // e.g., 'user.suspend', 'seller.approve'
  entityType: string;
  entityId: string;
  performedBy: string;     // FK to user (admin)
  metadata: JSON;          // {ip, userAgent, ...}
  before: JSON | null;
  after: JSON | null;
  createdAt: Date;
}
```

### Relationships
- User has many Roles (user_role)
- User can have one Seller profile
- Seller has many Documents
- Seller has one Bank Account
- Seller has many Timeline entries

---

## ⚡ Common Tasks

### Adding a New API Endpoint

1. **Define the route** in `apps/server/src/routes/`
2. **Add validation** using Zod schemas
3. **Implement handler** with database queries
4. **Add audit logging** if admin action
5. **Mount route** in `apps/server/src/index.ts`
6. **Create API client** function in `apps/web/src/lib/api/`
7. **Use in component** with React Query

### Adding a New Page

1. **Create route file** in `apps/web/src/routes/`
2. **Define component** with TanStack Router patterns
3. **Fetch data** using React Query
4. **Add navigation** link in layout component
5. **Test** with hot reload

### Database Schema Changes

```bash
# 1. Modify schema in packages/db/src/schema/
# 2. Generate migration
bun run db:generate

# 3. Review migration SQL in packages/db/src/migrations/
# 4. Apply migration
bun run db:push

# 5. Update TypeScript types (automatic)
```

### File Upload Flow

1. **Frontend**: User selects file via `<input type="file">`
2. **Frontend**: Convert to FormData, POST to `/api/seller/documents/upload`
3. **Backend**: Validate file (type, size)
4. **Backend**: Upload to Supabase Storage using `uploadFile()` from `lib/storage.ts`
5. **Backend**: Store metadata in `seller_document` table
6. **Backend**: Return signed URL (1-hour expiry)
7. **Frontend**: Display document in UI

### Email Notifications

```typescript
import { sendEmail } from '@/lib/email/service';
import { sellerVerificationApprovedTemplate } from '@/lib/email/templates';

await sendEmail({
  to: seller.contactEmail,
  subject: 'Seller Application Approved',
  html: sellerVerificationApprovedTemplate({
    sellerName: seller.businessName,
    loginUrl: `${process.env.WEB_URL}/login`,
  }),
});
```

---

## 🔍 Important Context

### Recent Migrations

#### Cloudinary → Supabase Storage (Feb 2026)
- **What**: Replaced Cloudinary with Supabase Storage for file uploads
- **Why**: Cost savings, local development, unified stack
- **Changes**:
  - Database column: `cloudinaryPublicId` → `storageKey`
  - New package: `@supabase/storage-js`
  - Service role JWT authentication
  - Signed URLs (1-hour expiry) instead of permanent CDN URLs
- **Docs**: See `docs/MIGRATION_SUMMARY.md`

### Admin Panel (Epic 14)
- **Completed**: Full admin dashboard, user management, seller verification, document review, audit logs
- **Docs**: See `docs/ADMIN_PANEL_IMPLEMENTATION.md`

### Authentication Flow
- Uses Better Auth library
- Email/password + Google OAuth
- Session-based (cookies)
- Role-based access control (RBAC)

### Seller Verification Workflow
1. User signs up → gets `customer` role
2. Applies as seller → creates seller profile
3. Uploads required documents
4. Admin reviews documents and seller info
5. Admin approves/rejects/requests-more-info
6. Seller gets email notification
7. Approved sellers get `seller` role

---

## 📍 File Locations

### Configuration Files
- Environment schemas: `packages/env/src/server.ts` and `packages/env/src/web.ts`
- TypeScript config: `packages/config/tsconfig.base.json`
- Tailwind config: `apps/web/tailwind.config.ts`
- Supabase config: `supabase/config.toml`

### Critical Files
- Server entry: `apps/server/src/index.ts`
- Root layout: `apps/web/src/routes/__root.tsx`
- Database schema: `packages/db/src/schema/`
- Storage client: `apps/server/src/lib/storage.ts`
- Admin auth: `apps/server/src/middleware/admin-auth.ts`
- Email service: `apps/server/src/lib/email/service.ts`

### Scripts
- Make admin: `packages/db/src/make-admin.ts`
- Seed roles: `packages/db/src/seed-roles.ts`
- Test uploads: `/test-document-upload.sh`

---

## 📚 Additional Documentation

- **[Admin Panel Implementation](./docs/ADMIN_PANEL_IMPLEMENTATION.md)** - Complete guide to admin features
- **[Storage Migration Summary](./docs/MIGRATION_SUMMARY.md)** - Cloudinary to Supabase migration details
- **[README.md](./README.md)** - Project overview and setup

---

## 💡 Tips for Working with Claude

### When Asking Claude for Help

1. **Be Specific**: Mention the exact file path and line numbers
2. **Provide Context**: Reference related files and their relationships
3. **Share Error Messages**: Include full stack traces when debugging
4. **Describe Intent**: Explain what you're trying to achieve, not just what you want to code

### Good Prompts Examples

✅ "In `apps/server/src/routes/admin/sellers.ts`, add a new endpoint to bulk approve sellers. It should accept an array of seller IDs, validate them, update their status to 'approved', and log the action in audit_log."

✅ "The file upload in `seller-uploads.ts` is failing with 'Invalid Access Key'. Check the Supabase Storage configuration in `lib/storage.ts` and verify the service role key is correct."

✅ "Create a new admin page at `/admin/reports` that shows seller approval statistics. Follow the pattern used in the dashboard page."

### Before Making Changes

- Claude has read this file and understands the project structure
- Reference this file's conventions when requesting features
- Claude will maintain consistency with existing patterns

### After Changes

- Test locally before committing
- Run type checking: `bun run check-types`
- Update this file if you add new patterns or conventions

---

## 🤝 Contributing

When working with others:

1. **Pull latest changes** before starting work
2. **Create feature branches** from `main`
3. **Test thoroughly** with local Supabase instance
4. **Document new features** in relevant `/docs` files
5. **Update this CLAUDE.md** if you add new patterns

---

## 📞 Getting Help

- **Database Issues**: Check `packages/db/src/migrations/` for recent changes
- **Auth Issues**: Review Better Auth docs and `packages/auth/src/index.ts`
- **Storage Issues**: See `docs/MIGRATION_SUMMARY.md` for Supabase Storage setup
- **Admin Features**: Reference `docs/ADMIN_PANEL_IMPLEMENTATION.md`

---

**Last Updated**: February 2026
**Maintainer**: DeshGhuri Development Team
