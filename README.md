# DeshGhuri

A modern tourism and booking marketplace platform connecting customers with verified sellers for experiences, accommodations, and services across Bangladesh.

## Overview

DeshGhuri is a full-stack TypeScript monorepo application that enables:
- **Customers** to discover, book, and review tourism experiences
- **Sellers** to list and manage their offerings with a comprehensive dashboard
- **Admins** to oversee operations, verify sellers, and manage the platform

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: TanStack Router (file-based)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: Hono.js (Express-like, edge-optimized)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (multi-role RBAC)
- **File Storage**: Supabase Storage (S3-compatible)
- **Email**: Resend

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Runtime**: Node.js / Bun
- **Type Safety**: TypeScript strict mode

## Project Structure

```
DeshGhuri/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── server/       # Hono.js backend API
├── packages/
│   ├── auth/         # Better Auth configuration
│   ├── db/           # Drizzle ORM schema & migrations
│   └── ui/           # Shared UI components
├── docs/             # Project documentation
└── CLAUDE.md         # AI assistant context & conventions
```

## Key Features

### Multi-Role Authentication
- Independent authentication flows for customers, sellers, and admins
- Role-based access control (RBAC)
- Role switcher for users with multiple roles
- Session management with Better Auth

### Seller Dashboard
- Analytics and performance insights
- Listings management
- Bookings and calendar
- Earnings and payouts
- Review management
- Proof center for service verification
- Inbox for customer inquiries

### Admin Panel
- User management
- Seller verification and approval workflow
- Document review
- Listings moderation
- Bookings oversight
- Transaction monitoring
- Audit logs

### Customer Experience
- Search and discovery
- Booking flow
- Wishlist and cart
- Reviews and ratings
- Order tracking

## Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Docker Desktop (for local Supabase)
- Supabase CLI (install via npm)
- Resend account (for email)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd DeshGhuri

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
bun run db:migrate

# Start development servers
bun run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/ui (Scalar API docs)

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Project context and conventions for AI assistance
- **[docs/SETUP.md](./docs/SETUP.md)** - Complete setup instructions
- **[docs/LOCAL_SUPABASE_SETUP.md](./docs/LOCAL_SUPABASE_SETUP.md)** - Local Supabase with S3 storage setup
- **[docs/prd.md](./docs/prd.md)** - Product requirements document
- **[docs/SELLER_DASHBOARD_QUICKSTART.md](./docs/SELLER_DASHBOARD_QUICKSTART.md)** - Seller dashboard guide
- **[docs/BECOME_SELLER_IMPLEMENTATION.md](./docs/BECOME_SELLER_IMPLEMENTATION.md)** - Seller onboarding flow

## Development

### Available Scripts

```bash
# Development
bun run dev              # Start all apps in development mode
bun run dev:web          # Start frontend only
bun run dev:server       # Start backend only

# Database
bun run db:generate      # Generate migration files
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Building
bun run build            # Build all apps for production
bun run build:web        # Build frontend only
bun run build:server     # Build backend only

# Type checking
bun run typecheck        # Check types across all packages
```

### Key Conventions

- **Route Protection**: Use `beforeLoad` in TanStack Router routes to verify authentication and roles
- **Component Structure**: Follow shadcn/ui patterns with BaseUI primitives
- **API Design**: Hono RPC for type-safe client-server communication
- **Database**: Drizzle ORM with PostgreSQL, migrations in `packages/db/migrations`
- **Authentication**: Better Auth for all auth flows, custom Argon2 for seller passwords

## Environment Variables

Key environment variables required:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/deshghuri

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Supabase Storage
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Email (Resend)
RESEND_API_KEY=your-resend-key
```

See `.env.example` for complete list.

## Contributing

1. Create a feature branch from `main`
2. Make your changes following existing patterns
3. Test thoroughly (authentication, role access, UI)
4. Submit a pull request with clear description

## License

[Add your license here]

## Support

For questions or issues, please refer to the documentation or contact the development team.
