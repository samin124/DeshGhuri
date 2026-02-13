# DeshGhuri - Presentation & Interview Guide

Complete guide for presenting your project to judges and answering technical questions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Features Implemented](#3-features-implemented)
4. [Code Implementation Details](#4-code-implementation-details)
5. [System Workflows](#5-system-workflows)
6. [Interview Q&A](#6-interview-qa)
7. [Demo Script](#7-demo-script)
8. [Quick Setup for Presentation](#8-quick-setup-for-presentation)

---

## 1. Project Overview

### 1.1 What is DeshGhuri?

**DeshGhuri** is a **multi-vendor travel marketplace platform** for Bangladesh that connects travelers with verified travel agencies, hotels, and tour operators.

### 1.2 Key Value Propositions

| Feature                 | Problem Solved                             | Solution                                                |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------- |
| **Escrow Payments**     | Trust issues between buyers and sellers    | Funds held securely until service is verified           |
| **Group Booking**       | Coordination difficulties for group travel | Automated tiered discounts and split payments           |
| **Verified Sellers**    | Scams and unreliable services              | Document verification before seller activation          |
| **Price Lock**          | Price fluctuations after booking           | Auto-refund if price drops after booking                |
| **Proof-Based Release** | Disputes about service delivery            | Sellers submit proof, funds released after verification |

### 1.3 Target Users

- **Customers**: Individual and group travelers
- **Sellers**: Travel agencies, hotels, tour operators
- **Admins**: Platform operations team

---

## 2. Tech Stack & Architecture

### 2.1 Technology Stack

| Layer                | Technology               | Purpose                                    |
| -------------------- | ------------------------ | ------------------------------------------ |
| **Frontend**         | React 19 + Vite          | UI framework and build tool                |
| **Routing**          | TanStack Router          | File-based routing with type safety        |
| **State Management** | TanStack Query           | Server state caching and synchronization   |
| **Styling**          | Tailwind CSS + shadcn/ui | Utility-first CSS + component library      |
| **Backend**          | Hono                     | Fast, lightweight web framework            |
| **Authentication**   | Better Auth              | Session-based auth with OAuth support      |
| **Database**         | PostgreSQL + Drizzle ORM | Relational database with type-safe queries |
| **File Storage**     | Supabase Storage         | S3-compatible object storage               |
| **Monorepo**         | Turborepo + Bun          | Build system and package manager           |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DESHGHURI ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     │
│  │   Frontend   │     │   Backend    │     │   Database   │     │
│  │  (apps/web)  │────▶│ (apps/server)│────▶│ (PostgreSQL) │     │
│  │              │     │              │     │              │     │
│  │  React 19    │     │  Hono        │     │  Drizzle ORM │     │
│  │  TanStack    │     │  Better Auth │     │  19 Tables   │     │
│  │  Tailwind    │     │  RPC API     │     │              │     │
│  └──────────────┘     └──────────────┘     └──────────────┘     │
│         │                    │                    │              │
│         │                    │                    │              │
│         ▼                    ▼                    │              │
│  ┌──────────────┐     ┌──────────────┐           │              │
│  │   Packages   │     │   Storage    │           │              │
│  │              │     │              │           │              │
│  │  @auth       │     │  Supabase    │◀──────────┘              │
│  │  @db         │     │  (S3-like)   │                          │
│  │  @env        │     │              │                          │
│  │  @config     │     │  Buckets:    │                          │
│  └──────────────┘     │  - listings  │                          │
│                       │  - avatars   │                          │
│                       │  - documents │                          │
│                       └──────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Monorepo Structure

```
DeshGhuri/
├── apps/
│   ├── web/                 # Frontend React app
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── routes/      # File-based routes
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and API clients
│   │   │   └── types/       # TypeScript types
│   │   └── package.json
│   │
│   └── server/              # Backend Hono app
│       ├── src/
│       │   ├── routes/      # API endpoints
│       │   ├── middleware/  # Auth middleware
│       │   ├── lib/         # Utilities
│       │   └── index.ts     # Entry point
│       └── package.json
│
├── packages/
│   ├── auth/                # Authentication logic
│   │   └── src/
│   │       ├── index.ts     # Better Auth config
│   │       └── seller-auth.ts # Custom seller auth
│   │
│   ├── db/                  # Database schema
│   │   └── src/
│   │       ├── schema/      # Drizzle schemas
│   │       └── index.ts     # DB connection
│   │
│   ├── env/                 # Environment validation
│   └── config/              # Shared TypeScript config
│
└── docs/                    # Documentation
```

---

## 3. Features Implemented

### 3.1 Customer Features

| Feature           | Status | Description                              |
| ----------------- | ------ | ---------------------------------------- |
| Browse Listings   | ✅     | Search, filter, and view travel listings |
| Flash Deals       | ✅     | Time-limited discounts with countdown    |
| Trending Listings | ✅     | Popular listings based on views/bookings |
| Categories        | ✅     | Browse by Hotels, Tours, Experiences     |
| User Registration | ✅     | Email/password signup with verification  |
| Login             | ✅     | Email/password + Google OAuth ready      |
| Booking System    | ✅     | Hold → Pay → Confirmed flow              |
| Cart/Hold         | ✅     | 10-minute inventory hold                 |
| Reviews           | ✅     | Ratings and reviews per listing          |

### 3.2 Seller Features

| Feature               | Status | Description                                |
| --------------------- | ------ | ------------------------------------------ |
| Seller Registration   | ✅     | Multi-step form with document upload       |
| Document Upload       | ✅     | Trade license, NID, bank info              |
| Verification Workflow | ✅     | Pending → Under Review → Approved/Rejected |
| Dashboard             | ✅     | Overview with stats and analytics          |
| Listing Management    | ✅     | CRUD operations for listings               |
| Booking Management    | ✅     | View and manage incoming bookings          |
| Proof Submission      | ✅     | Upload service completion proof            |
| Payout Configuration  | ✅     | Bank account and mobile payment setup      |

### 3.3 Admin Features

| Feature             | Status | Description                          |
| ------------------- | ------ | ------------------------------------ |
| Admin Dashboard     | ✅     | Platform statistics and metrics      |
| Seller Verification | ✅     | Review and approve/reject sellers    |
| Document Review     | ✅     | View uploaded verification documents |
| User Management     | ✅     | View and manage all users            |
| Audit Logs          | ✅     | Track all admin actions              |
| Booking Oversight   | ✅     | View all platform bookings           |

### 3.4 Platform Features

| Feature           | Status | Description                          |
| ----------------- | ------ | ------------------------------------ |
| Multi-Role Auth   | ✅     | Customer, Seller, Admin, Super Admin |
| Role Switching    | ✅     | Switch contexts without re-login     |
| Escrow System     | ✅     | Secure fund holding                  |
| Email Service     | ✅     | Verification and notification emails |
| File Storage      | ✅     | Supabase Storage integration         |
| API Documentation | ✅     | OpenAPI docs at /docs                |

---

## 4. Code Implementation Details

### 4.1 Authentication System

#### Multi-Role Architecture

Users can have **multiple roles simultaneously**. A single user can be both a customer and a seller.

**File: `packages/auth/src/index.ts`**

```typescript
// Better Auth configuration
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },
  // Hooks for role assignment on signup
  hooks: {
    after: [
      {
        matcher: (ctx) => ctx.path === '/sign-up/email',
        handler: async (ctx) => {
          // Assign 'customer' role to new users
          await db.insert(userRole).values({
            userId: ctx.returned.id,
            role: 'customer',
          });
        },
      },
    ],
  },
});
```

#### Custom Seller Authentication

**File: `packages/auth/src/seller-auth.ts`**

```typescript
// Independent seller registration with Argon2 hashing
export async function sellerSignup(data: SellerSignupData) {
  // 1. Hash password with Argon2
  const hashedPassword = await hash(data.password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  // 2. Create user record
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.businessName,
      emailVerified: false,
    })
    .returning();

  // 3. Create seller profile (pending status)
  const [seller] = await db
    .insert(sellers)
    .values({
      userId: user.id,
      businessName: data.businessName,
      category: data.category,
      verificationStatus: 'pending',
    })
    .returning();

  // 4. Assign seller role
  await db.insert(userRole).values({
    userId: user.id,
    role: 'seller',
  });

  return { user, seller };
}
```

### 4.2 Route Protection Pattern

**File: `apps/web/src/lib/auth/role-guard.ts`**

```typescript
// Route guard for seller routes
export async function requireSellerAccess(returnPath?: string) {
  const session = await authClient.getSession();

  if (!session) {
    throw redirect({
      to: '/login',
      search: { return: returnPath || '/seller/dashboard' },
    });
  }

  // Fetch roles from API
  const response = await fetch('/api/auth/roles');
  const { roles } = await response.json();

  if (!roles.includes('seller')) {
    throw redirect({ to: '/' });
  }

  // Check seller approval status
  const sellerResponse = await fetch('/api/seller/auth/me');
  const seller = await sellerResponse.json();

  if (seller.verificationStatus !== 'approved') {
    throw redirect({ to: '/seller/verification-status' });
  }
}
```

**Usage in Route:**

```typescript
// apps/web/src/routes/seller/dashboard.tsx
export const Route = createFileRoute('/seller/dashboard')({
  beforeLoad: async ({ location }) => {
    await requireSellerAccess(location.pathname);
  },
  component: SellerDashboard,
});
```

### 4.3 API Endpoints Structure

**File: `apps/server/src/index.ts`**

```typescript
const app = new Hono();

// Mount routes
app.route('/api/auth', authRoutes); // Better Auth
app.route('/api/auth/roles', rolesRoutes); // Role checking
app.route('/api/seller/auth', sellerAuth); // Seller auth
app.route('/api/seller/dashboard', sellerDashboard); // Protected
app.route('/api/seller/listings', sellerListings); // Protected
app.route('/api/admin', adminRoutes); // Protected

// Middleware example
app.use('/api/seller/*', requireSellerAccount);
app.use('/api/admin/*', requireAdmin);
```

### 4.4 Database Schema Examples

**File: `packages/db/src/schema/auth.ts`**

```typescript
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const userRole = pgTable('user_role', {
  userId: text('userId')
    .references(() => users.id)
    .notNull(),
  role: text('role', { enum: ['customer', 'seller', 'admin', 'super_admin'] }).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});
```

**File: `packages/db/src/schema/seller.ts`**

```typescript
export const sellers = pgTable('seller', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('userId')
    .references(() => users.id)
    .notNull(),
  businessName: text('businessName').notNull(),
  category: text('category', {
    enum: ['agency', 'hotel', 'tour_operator'],
  }).notNull(),
  verificationStatus: text('verificationStatus', {
    enum: ['pending', 'under_review', 'approved', 'rejected'],
  }).default('pending'),
  verifiedAt: timestamp('verifiedAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});
```

### 4.5 File Upload Implementation

**File: `apps/server/src/lib/storage.ts`**

```typescript
import { SupabaseStorage } from '@supabase/storage-js';

const storage = new SupabaseStorage({
  url: process.env.SUPABASE_URL,
  apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { data, error } = await storage.from(bucket).upload(path, file);

  if (error) throw error;

  return data.path;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data } = await storage.from(bucket).createSignedUrl(path, expiresIn);

  return data.signedUrl;
}
```

---

## 5. System Workflows

### 5.1 User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER REGISTRATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  User   │    │ Better  │    │ Database│    │  Email  │  │
│  │  Form   │───▶│  Auth   │───▶│  Insert │───▶│  Send   │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                      │                                       │
│                      ▼                                       │
│               ┌─────────────┐                               │
│               │ Assign Role │                               │
│               │ 'customer'  │                               │
│               └─────────────┘                               │
│                                                              │
│  Result: User created with 'customer' role                  │
│          Session created with 7-day expiry                   │
│          Verification email sent (optional)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Seller Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   SELLER REGISTRATION FLOW                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Account Details                                     │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Email + │───▶│ Argon2 Hash │───▶│ Create User Record  │  │
│  │Password │    │  Password   │    │                     │  │
│  └─────────┘    └─────────────┘    └─────────────────────┘  │
│                                                              │
│  Step 2: Business Information                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ Business    │───▶│ Create      │───▶│ Status: pending │  │
│  │ Details     │    │ Seller      │    │                 │  │
│  └─────────────┘    │ Profile     │    └─────────────────┘  │
│                     └─────────────┘                          │
│                                                              │
│  Step 3: Document Upload                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ Trade       │───▶│ Upload to   │───▶│ Create Document │  │
│  │ License, NID│    │ Supabase    │    │ Records        │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                                                              │
│  Step 4: Role Assignment                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Insert into user_role: { userId, role: 'seller' }       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Step 5: Admin Approval                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ Admin       │───▶│ Review      │───▶│ Status Change:  │  │
│  │ Review      │    │ Documents   │    │ approved/reject │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      BOOKING FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────┐                                              │
│  │  DRAFT    │  User clicks "Book Now"                     │
│  └─────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│  ┌───────────┐    ┌─────────────────────────────────────┐  │
│  │   HOLD    │───▶│ Inventory reserved for 10 minutes   │  │
│  └─────┬─────┘    │ Countdown timer shown to user       │  │
│        │          └─────────────────────────────────────┘  │
│        │                                                     │
│        ▼                                                     │
│  ┌───────────────┐                                          │
│  │ PAYMENT       │  User pays via bKash/Nagad/Card        │
│  │ PENDING       │                                          │
│  └───────┬───────┘                                          │
│          │                                                   │
│    ┌─────┴─────┐                                            │
│    │           │                                            │
│    ▼           ▼                                            │
│ ┌────────┐  ┌──────────┐                                    │
│ │SUCCESS │  │  FAILED  │                                    │
│ └───┬────┘  └────┬─────┘                                    │
│     │            │                                           │
│     │            ▼                                           │
│     │     ┌───────────┐                                     │
│     │     │  EXPIRED  │  Release hold, notify user          │
│     │     └───────────┘                                     │
│     │                                                       │
│     ▼                                                       │
│ ┌───────────┐    ┌─────────────────────────────────────┐  │
│ │CONFIRMED  │───▶│ Funds move to ESCROW                │  │
│ └─────┬─────┘    │ Booking confirmation sent           │  │
│       │          └─────────────────────────────────────┘  │
│       │                                                     │
│       ▼                                                     │
│ ┌───────────┐    ┌─────────────────────────────────────┐  │
│ │ COMPLETED │───▶│ Seller submits proof of service     │  │
│ └─────┬─────┘    │ Admin/System verifies               │  │
│       │          └─────────────────────────────────────┘  │
│       │                                                     │
│       ▼                                                     │
│ ┌───────────┐    ┌─────────────────────────────────────┐  │
│ │  FUNDS    │───▶│ Funds released to seller            │  │
│  │ RELEASED │    │ Platform fee deducted               │  │
│  └──────────┘    └─────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Multi-Role Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  MULTI-ROLE SESSION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User with multiple roles (e.g., customer + seller):        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Single Session Token                     │   │
│  │         (better-auth.session_token cookie)           │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│              ┌─────────────────────┐                        │
│              │ GET /api/auth/roles │                        │
│              │ Returns: ['customer',│                       │
│              │          'seller']   │                       │
│              └──────────┬──────────┘                        │
│                         │                                    │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │   RoleSwitcher      │                        │
│              │   Component         │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
│          ┌──────────────┼──────────────┐                   │
│          ▼              ▼              ▼                    │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐             │
│   │ Customer  │  │  Seller   │  │   Admin   │             │
│   │   View    │  │ Dashboard │  │   Panel   │             │
│   └───────────┘  └───────────┘  └───────────┘             │
│                                                              │
│   → No re-login required when switching                     │
│   → Single session, multiple contexts                       │
│   → Logout = complete logout from all roles                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Interview Q&A

### 6.1 Project Overview Questions

**Q: What is DeshGhuri and what problem does it solve?**

A: DeshGhuri is a multi-vendor travel marketplace for Bangladesh. It solves trust issues in online travel booking through:

- **Escrow payments**: Funds are held securely until service is verified
- **Verified sellers**: Only approved sellers can list services
- **Group booking**: Automated coordination with tiered discounts
- **Price lock**: Auto-refund if prices drop after booking

---

**Q: Why did you choose this tech stack?**

A:

- **React + TanStack**: Type-safe routing and efficient server state management
- **Hono**: Lightweight, fast framework perfect for API servers
- **Better Auth**: Modern authentication with session management built-in
- **Drizzle ORM**: Type-safe SQL queries with excellent TypeScript support
- **Turborepo**: Monorepo management with efficient builds
- **Bun**: Fast JavaScript runtime, faster than Node.js

---

### 6.2 Architecture Questions

**Q: Explain your monorepo structure.**

A: The project is organized as a Turborepo monorepo:

- `apps/web`: Frontend React application
- `apps/server`: Backend Hono API server
- `packages/auth`: Shared authentication logic
- `packages/db`: Database schema and migrations
- `packages/env`: Environment variable validation
- `packages/config`: Shared TypeScript configurations

This enables code sharing, type safety across packages, and efficient builds.

---

**Q: How does authentication work in your system?**

A: We use Better Auth for session-based authentication:

1. **Session creation**: On login, a session token is created and stored in an HTTP-only cookie
2. **Session validation**: Each request validates the session token
3. **Role-based access**: The `user_role` table stores role assignments
4. **Multi-role support**: A single user can have multiple roles (customer + seller)
5. **Role switching**: Users can switch contexts without re-login using the RoleSwitcher component

For sellers, we have a custom authentication flow with Argon2 password hashing and document verification.

---

**Q: How do you protect routes on the frontend?**

A: We use TanStack Router's `beforeLoad` hook:

```typescript
export const Route = createFileRoute('/seller/dashboard')({
  beforeLoad: async ({ location }) => {
    // 1. Check session exists
    const session = await authClient.getSession();
    if (!session) throw redirect({ to: '/login' });

    // 2. Fetch roles
    const { roles } = await fetch('/api/auth/roles').then((r) => r.json());

    // 3. Verify role
    if (!roles.includes('seller')) throw redirect({ to: '/' });

    // 4. Check seller approval
    const seller = await fetch('/api/seller/auth/me').then((r) => r.json());
    if (seller.verificationStatus !== 'approved') {
      throw redirect({ to: '/seller/verification-status' });
    }
  },
});
```

---

### 6.3 Database Questions

**Q: How is your database structured?**

A: We have 19+ tables organized into:

- **Auth tables**: `user`, `session`, `account`, `verification`, `user_role`
- **Seller tables**: `seller`, `seller_document`, `seller_bank_account`
- **Marketplace tables**: `listing`, `booking`, `review`, `escrow_transaction`
- **Admin tables**: `audit_log`

Key relationships:

- User → User_Role (one-to-many)
- User → Seller (one-to-one)
- Seller → Listing (one-to-many)
- Listing → Booking (one-to-many)
- Booking → Escrow_Transaction (one-to-one)

---

**Q: How do you handle database migrations?**

A: Using Drizzle Kit:

1. Define schema in `packages/db/src/schema/`
2. Run `bun run db:generate` to create migration files
3. Run `bun run db:migrate` to apply migrations
4. Use `bun run db:studio` to view database in browser

---

### 6.4 Feature-Specific Questions

**Q: How does the seller verification process work?**

A:

1. Seller submits registration with documents (trade license, NID)
2. Documents uploaded to Supabase Storage (private bucket)
3. Seller profile created with `pending` status
4. Admin reviews documents in verification queue
5. Admin approves/rejects with optional reason
6. On approval: `verificationStatus` → `approved`, seller can access dashboard
7. On rejection: Seller sees reason, can re-upload documents

---

**Q: How does the escrow system work?**

A:

1. Customer pays for booking
2. Funds move to platform escrow account (not seller)
3. Seller delivers service
4. Seller submits proof of completion within 48 hours
5. Admin/System verifies proof
6. Funds released to seller (minus platform fee)
7. If dispute raised: funds frozen until resolution

---

**Q: How do you handle file uploads?**

A: Using Supabase Storage:

1. Frontend sends file to backend API
2. Backend validates file type and size
3. Backend uploads to Supabase Storage bucket
4. File path stored in database
5. Signed URLs generated for secure access

Buckets:

- `seller-documents`: Private, for verification documents
- `listings`: Public, for listing images
- `avatars`: Public, for user profile images

---

### 6.5 Technical Challenges Questions

**Q: What was the most challenging part of this project?**

A: **Multi-role authentication and session management** was the most challenging:

- Users can have multiple roles simultaneously
- Need to maintain single session while allowing context switching
- Route protection must check both session and role
- Seller authentication requires additional verification step

Solution:

- Single Better Auth session with role assignments in `user_role` table
- `/api/auth/roles` endpoint returns all user roles
- RoleSwitcher component allows context switching
- Separate middleware for seller approval status check

---

**Q: How do you ensure type safety across the monorepo?**

A:

1. **Shared types**: TypeScript interfaces in `types/` directories
2. **Drizzle ORM**: Type-safe database queries
3. **Hono RPC**: Type-safe API client generated from server
4. **Zod schemas**: Runtime validation with type inference
5. **Shared packages**: Types exported from `@DeshGhuri/db`, `@DeshGhuri/auth`

---

**Q: How do you handle errors in your application?**

A:

- **Frontend**: Try-catch with toast notifications (sonner)
- **Backend**: Hono error handling middleware
- **Database**: Drizzle transactions for atomic operations
- **API**: Consistent error response format with status codes

---

### 6.6 Security Questions

**Q: What security measures have you implemented?**

A:

1. **Authentication**:
   - HTTP-only cookies for session tokens
   - Secure flag in production
   - Session expiry (7 days)
   - Password hashing (Argon2 for sellers, Better Auth for users)

2. **Authorization**:
   - Role-based access control (RBAC)
   - Route protection with beforeLoad hooks
   - Backend middleware for all protected routes

3. **Data Security**:
   - Environment variables for secrets
   - Signed URLs for file access
   - Input validation with Zod

4. **Audit**:
   - All admin actions logged
   - Timestamp and user tracking

---

## 7. Demo Script

### 7.1 Demo Flow (10-15 minutes)

#### Part 1: Homepage & Browse (2 min)

1. Open http://localhost:3001
2. Show hero section with search
3. Show flash deals with countdown timer
4. Show trending listings
5. Browse by category
6. Click a listing to show detail page

#### Part 2: User Registration (2 min)

1. Click "Login" in navbar
2. Click "Sign Up"
3. Fill registration form
4. Show success message
5. Check email at http://127.0.0.1:54324 (Mailpit)

#### Part 3: Seller Registration (3 min)

1. Go to http://localhost:3001/seller
2. Click "Sign Up as Seller"
3. Fill email and password
4. Fill business information
5. Upload sample documents
6. Show pending status page

#### Part 4: Admin Verification (3 min)

1. Login as admin: admin@deshghuri.com / Admin@123456
2. Show admin dashboard
3. Go to Sellers > Verification Queue
4. Show pending seller application
5. Review documents
6. Approve seller
7. Show audit log

#### Part 5: Seller Dashboard (3 min)

1. Login as the approved seller
2. Show dashboard with stats
3. Create a new listing
4. Show listing in list
5. Show bookings (if any)

#### Part 6: Role Switching (2 min)

1. Login as admin (has customer + admin roles)
2. Show RoleSwitcher in navbar
3. Switch between "Customer View" and "Admin Panel"
4. Explain no re-login needed

---

## 8. Quick Setup for Presentation

### 8.1 Pre-Presentation Checklist

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
bun install

# 3. Start PostgreSQL (ensure it's running)

# 4. Start Supabase (for file storage)
supabase start

# 5. Run migrations (if needed)
bun run db:migrate

# 6. Start development
bun run dev
```

### 8.2 Verify Everything Works

```bash
# Check frontend
curl http://localhost:3001

# Check backend
curl http://localhost:3000/docs

# Check Supabase
supabase status
```

### 8.3 Demo Accounts

| Role     | Email                      | Password     |
| -------- | -------------------------- | ------------ |
| Admin    | admin@deshghuri.com        | Admin@123456 |
| Customer | (create new)               | -            |
| Seller   | (create new, then approve) | -            |

### 8.4 URLs to Remember

| Service         | URL                        |
| --------------- | -------------------------- |
| Frontend        | http://localhost:3001      |
| Backend API     | http://localhost:3000      |
| API Docs        | http://localhost:3000/docs |
| Supabase Studio | http://127.0.0.1:54323     |
| Email Viewer    | http://127.0.0.1:54324     |
| Drizzle Studio  | `bun run db:studio`        |

---

## Quick Reference Cards

### Commands

```bash
# Development
bun run dev              # Start all apps
bun run dev:web          # Frontend only
bun run dev:server       # Backend only

# Database
bun run db:generate      # Generate migration
bun run db:migrate       # Apply migrations
bun run db:studio        # Open Drizzle Studio

# Build
bun run build            # Build all
bun run check-types      # Type check
```

### Key Files

| Purpose       | File                                               |
| ------------- | -------------------------------------------------- |
| Auth Config   | `packages/auth/src/index.ts`                       |
| Seller Auth   | `packages/auth/src/seller-auth.ts`                 |
| User Schema   | `packages/db/src/schema/auth.ts`                   |
| Seller Schema | `packages/db/src/schema/seller.ts`                 |
| API Entry     | `apps/server/src/index.ts`                         |
| Role Guard    | `apps/web/src/lib/auth/role-guard.ts`              |
| Navbar        | `apps/web/src/components/layout/navbar.tsx`        |
| Role Switcher | `apps/web/src/components/layout/role-switcher.tsx` |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-13  
**Author**: DeshGhuri Development Team
