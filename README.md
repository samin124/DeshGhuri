# DeshGhuri 🇧🇩

> **A modern travel and tourism platform connecting travelers with verified sellers across Bangladesh**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.6-black)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

- **🔐 Secure Authentication** - Email/password and Google OAuth via Better Auth
- **🏢 Seller Onboarding** - Multi-step verification process with document validation
- **👨‍💼 Admin Panel** - Complete management system for users, sellers, and documents
- **📁 Document Management** - Supabase Storage integration for secure file handling
- **📧 Email Notifications** - Automated notifications for verification status changes
- **🔍 Audit Logging** - Comprehensive tracking of all admin actions
- **🎨 Modern UI** - Beautiful, responsive interface built with Tailwind CSS and Radix UI

## 🛠 Tech Stack

### Backend
- **[Bun](https://bun.sh/)** - Fast all-in-one JavaScript runtime
- **[Hono](https://hono.dev/)** - Ultrafast web framework
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[Better Auth](https://www.better-auth.com/)** - Full-featured authentication
- **[Supabase](https://supabase.com/)** - PostgreSQL database and storage
- **[OpenAPI](https://www.openapis.org/)** - API documentation with Scalar

### Frontend
- **[React 19](https://react.dev/)** - UI library
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Vite](https://vitejs.dev/)** - Next-gen build tool

### Infrastructure
- **PostgreSQL 17** - Relational database
- **Docker** - Containerization for local development
- **Bun Workspaces** - Monorepo management

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.3.6 or higher
- [Docker](https://www.docker.com/) (for local Supabase)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/DeshGhuri.git
cd DeshGhuri

# Install dependencies
bun install

# Start Supabase (PostgreSQL + Storage)
cd supabase
supabase start

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files with your configuration
# See CLAUDE.md for detailed environment setup

# Push database schema
bun run db:push

# Seed initial data
cd packages/db
bun run db:seed-roles

# Create an admin user
bun run db:make-admin your-email@example.com

# Start development servers
cd ../..
bun run dev
```

### Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs
- **Supabase Studio**: http://localhost:54323
- **Drizzle Studio**: `bun run db:studio`

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive guide for AI-assisted development
- **[Admin Panel Implementation](./docs/ADMIN_PANEL_IMPLEMENTATION.md)** - Admin features documentation
- **[Migration Summary](./docs/MIGRATION_SUMMARY.md)** - Storage migration details

## 🏗 Project Structure

```
DeshGhuri/
├── apps/
│   ├── server/          # Backend API (Hono + Bun)
│   │   ├── src/
│   │   │   ├── routes/     # API endpoints
│   │   │   ├── middleware/ # Auth & validation
│   │   │   └── lib/        # Utilities (storage, email, etc.)
│   │   └── package.json
│   │
│   └── web/             # Frontend (React + Vite)
│       ├── src/
│       │   ├── routes/     # Pages (file-based routing)
│       │   ├── components/ # React components
│       │   └── lib/        # Client utilities
│       └── package.json
│
├── packages/
│   ├── auth/            # Better Auth configuration
│   ├── db/              # Database schema & migrations
│   ├── env/             # Environment validation
│   └── config/          # Shared configs
│
├── supabase/            # Local Supabase setup
├── docs/                # Documentation
└── package.json         # Root package.json
```

## 🔑 Key Features Explained

### Authentication
- Secure email/password authentication
- Google OAuth integration
- Session-based auth with cookies
- Role-based access control (Customer, Seller, Admin, Super Admin)

### Seller Onboarding
1. User signs up as a customer
2. Applies to become a seller
3. Completes multi-step form (business info, documents, bank details)
4. Admin reviews application and documents
5. Seller gets approved/rejected notification
6. Approved sellers can list their services

### Admin Panel
- **Dashboard**: Overview stats and pending actions
- **User Management**: View, edit, suspend, delete users
- **Seller Verification**: Review applications, approve/reject sellers
- **Document Review**: Validate uploaded documents (IDs, licenses, etc.)
- **Audit Logs**: Track all admin actions with full history
- **Email System**: Automated notifications for status changes

### File Storage
- Supabase Storage (S3-compatible)
- Signed URLs for secure access (1-hour expiry)
- Support for PDFs, JPGs, PNGs
- 25MB file size limit
- Automatic MIME type detection

## 🧪 Testing

```bash
# Type checking
bun run check-types

# Run test script for document uploads
./test-document-upload.sh

# Database migrations test
bun run db:generate
bun run db:push
```

## 📝 Scripts

```bash
# Development
bun run dev              # Start all services
bun run dev:server       # Backend only
bun run dev:web          # Frontend only

# Database
bun run db:push          # Push schema changes
bun run db:studio        # Open Drizzle Studio
bun run db:generate      # Generate migrations
bun run db:seed-roles    # Seed user roles
bun run db:make-admin    # Make user an admin

# Production
bun run build            # Build all packages
bun run start            # Start production server
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/DeshGhuri.git`
3. **Create a branch**: `git checkout -b feature/amazing-feature`
4. **Read CLAUDE.md**: Understand the project structure and conventions
5. **Make your changes**: Follow existing patterns and TypeScript strict mode
6. **Test thoroughly**: Run type checking and manual tests
7. **Commit**: `git commit -m "Add amazing feature"`
8. **Push**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**: Describe your changes in detail

### Development Tips

- Use **CLAUDE.md** as your development guide
- Follow existing code patterns and conventions
- Write type-safe code (strict TypeScript)
- Test with local Supabase instance before committing
- Update documentation when adding new features
- Use descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) for the amazing JavaScript runtime
- [Supabase](https://supabase.com/) for the open-source Firebase alternative
- [TanStack](https://tanstack.com/) for excellent React libraries
- [Better Auth](https://www.better-auth.com/) for authentication
- [Hono](https://hono.dev/) for the lightweight web framework

## 📞 Support

- **Documentation**: Check [CLAUDE.md](./CLAUDE.md) and `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-username/DeshGhuri/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/DeshGhuri/discussions)

---

**Built with ❤️ for Bangladesh** | **DeshGhuri Development Team**
