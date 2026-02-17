# Fresh Computer Setup (Pull and Run)

Use this guide when setting up DeshGhuri on a new machine from GitHub.

## 1. Prerequisites

Install these first:

- Git
- Bun `1.3.6+`
- Docker Desktop (must be running)
- Supabase CLI

Verify:

```bash
git --version
bun --version
supabase --version
docker --version
```

## 2. Clone and checkout branch

```bash
git clone https://github.com/samin124/DeshGhuri.git
cd DeshGhuri
git fetch --all
git checkout admin-and-seller-management
```

## 3. Install dependencies

```bash
bun install
```

## 4. Start local Supabase

From project root:

```bash
supabase start
```

Keep the output. You will need:

- `anon key`
- `service_role key`

Useful local endpoints after startup:

- Studio: `http://127.0.0.1:54323`
- Mail inbox: `http://127.0.0.1:54324`
- DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## 5. Create environment files

Create `apps/server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

BETTER_AUTH_SECRET=replace-with-32-plus-char-secret
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development

EMAIL_HOST=127.0.0.1
EMAIL_PORT=54325
EMAIL_USER=test@example.com
EMAIL_PASSWORD=test-password
EMAIL_FROM=noreply@deshghuri.local

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=replace-with-supabase-anon-key
SUPABASE_PROJECT_REF=local
SUPABASE_SERVICE_ROLE_KEY=replace-with-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=seller-documents
```

Create `apps/web/.env`:

```env
VITE_SERVER_URL=http://localhost:3000
VITE_API_MOCKING_ENABLED=false
```

Generate a secret for `BETTER_AUTH_SECRET`:

```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 6. Create storage buckets in Supabase Studio

Open `http://127.0.0.1:54323` and create:

- `seller-documents` (private)
- `listings` (public)
- `avatars` (public)

## 7. Run database migrations (and seed data)

From project root:

```bash
bun run db:migrate
bun run db:seed
```

## 8. Start the app

From project root:

```bash
bun run dev
```

App URLs:

- Web: `http://localhost:3001`
- API: `http://localhost:3000`
- API docs: `http://localhost:3000/docs`

## 9. Pull latest updates later

```bash
git checkout admin-and-seller-management
git pull origin admin-and-seller-management
```

## 10. Common quick fixes

- Port busy: stop the process using ports `3000` or `3001`.
- DB issues: run `supabase status`, then re-run `bun run db:migrate`.
- Missing dependencies: run `bun install` again from project root.

