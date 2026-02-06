# Local Supabase Setup (S3 Storage)

DeshGhuri uses **Supabase Local Development** with S3-compatible storage. This means Supabase runs on your local machine using Docker - no cloud account needed!

## Prerequisites

1. **Docker Desktop** (required for Supabase local)
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Make sure Docker is running before starting Supabase

2. **Supabase CLI**
   ```bash
   # Install via npm
   npm install -g supabase

   # Or via Homebrew (Mac)
   brew install supabase/tap/supabase

   # Verify installation
   supabase --version
   ```

## Quick Start

### Step 1: Start Supabase

From the project root:

```bash
# Start all Supabase services (PostgreSQL, Storage, Auth, Studio, etc.)
supabase start
```

This will start:
- **PostgreSQL** on port `54322`
- **Supabase API** on port `54321`
- **Supabase Studio** (UI) on `http://127.0.0.1:54323`
- **Storage with S3** (automatically configured)
- **Inbucket** (email testing) on port `54324`

**First time setup takes 2-3 minutes** to download Docker images.

### Step 2: Note the Credentials

After `supabase start`, you'll see output like this:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGci...
service_role key: eyJhbGci...
```

**Save these values!** You'll need them for environment variables.

### Step 3: Create Storage Buckets

**Option A: Via Supabase Studio (UI) - Recommended**

1. Open **Supabase Studio**: http://127.0.0.1:54323
2. Click **Storage** in left sidebar
3. Click **Create Bucket** button
4. Create these 3 buckets:

**Bucket 1: seller-documents**
- Name: `seller-documents`
- Public: ❌ No (Private)
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp,application/pdf`

**Bucket 2: listings**
- Name: `listings`
- Public: ✅ Yes
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`

**Bucket 3: avatars**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp`

**Option B: Via config.toml (Alternative)**

Add bucket configuration to `supabase/config.toml`:

```toml
[storage.buckets.seller-documents]
public = false
file_size_limit = "10MiB"
allowed_mime_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]

[storage.buckets.listings]
public = true
file_size_limit = "5MiB"
allowed_mime_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

[storage.buckets.avatars]
public = true
file_size_limit = "2MiB"
allowed_mime_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
```

Then restart Supabase:
```bash
supabase stop
supabase start
```

### Step 4: Configure Environment Variables

Edit `apps/server/.env`:

```bash
# Supabase Local URLs
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGci... # From supabase start output
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # From supabase start output
```

**Note**: These keys are LOCAL ONLY and safe to use. They're not production secrets.

## Verify Everything Works

### Test 1: Check Supabase Status

```bash
supabase status
```

Should show all services running.

### Test 2: Open Supabase Studio

Go to: http://127.0.0.1:54323

You should see:
- Database tables (after running migrations)
- Storage buckets (seller-documents, listings, avatars)
- Authentication users

### Test 3: Test File Upload

1. Start your server: `bun run dev`
2. Register as a seller: http://localhost:3001/seller/signup
3. Upload verification documents
4. Check Supabase Studio → Storage → seller-documents
5. Your uploaded files should appear!

## Common Commands

```bash
# Start Supabase
supabase start

# Stop Supabase (keeps data)
supabase stop

# Reset Supabase (deletes all data)
supabase db reset

# Check status
supabase status

# View logs
supabase logs

# Access database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Important Notes

### 1. Data Persistence

Data persists between `supabase stop` and `supabase start`. Your database, uploaded files, and buckets remain intact.

To completely reset and start fresh:
```bash
supabase db reset
```

### 2. Storage Location

Files are stored locally in Docker volumes, NOT in the cloud. They're automatically managed by Supabase.

### 3. S3 Protocol

The `supabase/config.toml` has S3 protocol enabled (line 119):
```toml
[storage.s3_protocol]
enabled = true
```

This means storage works like AWS S3, but locally!

### 4. Email Testing

Emails don't actually send. View them at: http://127.0.0.1:54324 (Inbucket)

### 5. No Cloud Account Needed

Everything runs locally. No Supabase cloud account required for development!

## Troubleshooting

### Error: "Docker not running"

**Solution**: Start Docker Desktop and wait for it to fully start.

### Error: "Port already in use"

**Solution**: Another service is using Supabase ports. Check what's using port 54321-54324:
```bash
lsof -i :54321
lsof -i :54322
```

### Buckets not appearing

**Solution**:
1. Make sure Supabase is running: `supabase status`
2. Refresh Supabase Studio (Ctrl+R or Cmd+R)
3. If buckets defined in config.toml, restart Supabase

### Files not uploading

**Solution**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` in `.env` is correct
2. Check bucket names match exactly: `seller-documents`, `listings`, `avatars`
3. Check file MIME type is allowed in bucket settings

### Database connection failed

**Solution**:
```bash
# Stop and start fresh
supabase stop
supabase start
```

## What Your Friend Needs to Do

Your friend should follow these steps after pulling the branch:

1. **Install Supabase CLI**: `npm install -g supabase`
2. **Install Docker Desktop** and make sure it's running
3. **Start Supabase**: `supabase start` (from project root)
4. **Create storage buckets** (via Studio or config.toml)
5. **Copy credentials** from `supabase start` output to `apps/server/.env`
6. **Run migrations**: `bun run db:migrate`
7. **Verify** in Supabase Studio: http://127.0.0.1:54323

That's it! No cloud accounts, no manual S3 setup, everything runs locally.

## Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
