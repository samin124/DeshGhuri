# DeshGhuri Setup Guide

Complete setup instructions for getting DeshGhuri running on your local development environment.

## Prerequisites

### Required Software

1. **Node.js 18+ or Bun 1.0+**
   - Download from [nodejs.org](https://nodejs.org/) or [bun.sh](https://bun.sh/)
   - Verify installation: `node --version` or `bun --version`

2. **PostgreSQL 14+**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Verify installation: `psql --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Required Accounts

1. **Supabase** (for file storage)
   - Sign up at [supabase.com](https://supabase.com/)
   - Create a new project
   - Note your project URL and API keys

2. **Resend** (for transactional emails)
   - Sign up at [resend.com](https://resend.com/)
   - Get your API key from the dashboard

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DeshGhuri
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

### 3. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE deshghuri;

# Exit psql
\q
```

#### Set Database URL

The database connection string format:
```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/deshghuri
```

### 4. Environment Variables

#### Create .env files

The project requires environment variables in multiple locations:

**Root `.env`** (for Turborepo):
```bash
cp .env.example .env
```

**`apps/server/.env`** (Backend configuration):
```bash
cd apps/server
cp .env.example .env
cd ../..
```

**`apps/web/.env`** (Frontend configuration):
```bash
cd apps/web
cp .env.example .env
cd ../..
```

#### Configure Environment Variables

Edit each `.env` file with your actual values:

**apps/server/.env:**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/deshghuri

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001
```

**apps/web/.env:**
```bash
# API
VITE_API_URL=http://localhost:3000

# Better Auth
VITE_BETTER_AUTH_URL=http://localhost:3000
```

#### Generate BETTER_AUTH_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32

# Using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Database Migrations

**IMPORTANT**: This step creates all database tables. Your friend MUST run this!

```bash
# Run migrations to create all tables
bun run db:migrate
```

This will automatically create all tables:
- ✅ Users and authentication (user, session, account, verification)
- ✅ Sellers and business profiles (seller, seller_document)
- ✅ Listings and categories (listing, category)
- ✅ Bookings and orders (booking, booking_guest)
- ✅ Reviews and ratings (review)
- ✅ Transactions and payouts (escrow_transaction, payout, proof_of_completion)
- ✅ Analytics (listing_analytics, seller_analytics)
- ✅ Admin audit logs (user_role)

**Verify tables were created:**
```bash
# Open Drizzle Studio to view tables
bun run db:studio
# Opens at http://localhost:4983
```

**Note**: If you change the schema later, run:
```bash
bun run db:generate  # Generate new migration file
bun run db:migrate   # Apply the migration
```

### 6. Supabase Local Storage Setup

**IMPORTANT**: Your friend MUST start Supabase locally and create buckets!

We use **Supabase Local Development** (runs on Docker) - no cloud account needed!

**Quick Setup:**
1. Install Docker Desktop and start it
2. Install Supabase CLI: `npm install -g supabase`
3. Start Supabase: `supabase start` (from project root)
4. Create 3 storage buckets via Studio (http://127.0.0.1:54323):
   - `seller-documents` (private)
   - `listings` (public)
   - `avatars` (public)
5. Copy credentials from terminal to `apps/server/.env`

**Detailed Instructions**: See [docs/LOCAL_SUPABASE_SETUP.md](./LOCAL_SUPABASE_SETUP.md) for complete guide.

### 7. Seed Initial Data (Optional)

Create an admin user manually in the database:

```bash
psql -U postgres -d deshghuri
```

```sql
-- Insert admin user (you'll need to hash the password properly)
-- For testing, you can create through the UI first, then update role
INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
VALUES ('admin-user-id', 'admin@deshghuri.com', 'Admin User', true, NOW(), NOW());

-- Assign admin role
INSERT INTO "role" ("userId", role, "createdAt")
VALUES ('admin-user-id', 'admin', NOW());
```

### 8. Start Development Servers

Start both frontend and backend:

```bash
bun run dev
```

Or start individually:

```bash
# Terminal 1 - Backend
bun run dev:server

# Terminal 2 - Frontend
bun run dev:web
```

### 9. Verify Installation

Check that everything is running:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/ui (Scalar API docs)

## Common Issues & Solutions

### Database Connection Error

**Error**: `ECONNREFUSED` or `Connection refused`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env` is correct
3. Ensure database exists: `psql -U postgres -l`

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
1. Find process using the port: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
2. Kill the process or change PORT in `.env`

### Migration Failed

**Error**: Migration errors during `bun run db:migrate`

**Solution**:
1. Check database is accessible
2. Verify DATABASE_URL is correct
3. Drop database and recreate if needed (development only):
   ```bash
   dropdb deshghuri
   createdb deshghuri
   bun run db:migrate
   ```

### Supabase Storage Errors

**Error**: `Supabase: Invalid API key`

**Solution**:
1. Verify SUPABASE_URL and keys in `.env`
2. Check Supabase project is active
3. Create required storage buckets in Supabase dashboard:
   - `seller-documents`
   - `listings`
   - `avatars`

### Email Not Sending

**Error**: Verification emails not received

**Solution**:
1. Verify RESEND_API_KEY is correct
2. Check Resend dashboard for delivery logs
3. Verify FROM_EMAIL is verified in Resend
4. Check spam folder

### Module Not Found Errors

**Error**: `Cannot find module '@/...'`

**Solution**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   bun install
   ```
2. Clear build cache:
   ```bash
   rm -rf .turbo
   bun run build
   ```

## Development Tools

### Drizzle Studio (Database GUI)

View and edit database contents:

```bash
bun run db:studio
```

Opens at: http://localhost:4983

### Type Checking

Run TypeScript type checker:

```bash
bun run typecheck
```

### Building for Production

```bash
# Build all packages
bun run build

# Build specific app
bun run build:web
bun run build:server
```

## Next Steps

After setup is complete:

1. **Create a test seller account**:
   - Go to http://localhost:3001/seller/signup
   - Fill in business information
   - Upload verification documents

2. **Test admin approval flow**:
   - Login as admin at http://localhost:3001/admin
   - Navigate to Sellers > Verification Queue
   - Approve the seller application

3. **Explore the codebase**:
   - Review [CLAUDE.md](../CLAUDE.md) for project conventions
   - Check [docs/prd.md](./prd.md) for feature requirements
   - Read [SELLER_DASHBOARD_QUICKSTART.md](./SELLER_DASHBOARD_QUICKSTART.md) for dashboard features

## Getting Help

If you encounter issues not covered here:

1. Check existing documentation in `/docs`
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Contact the development team

## Useful Commands Reference

```bash
# Development
bun run dev                    # Start all apps
bun run dev:web                # Frontend only
bun run dev:server             # Backend only

# Database
bun run db:generate            # Generate migrations
bun run db:migrate             # Run migrations
bun run db:studio              # Open Drizzle Studio

# Build
bun run build                  # Build all
bun run typecheck              # Type check

# Clean
rm -rf node_modules .turbo     # Full clean
bun install                    # Reinstall
```
