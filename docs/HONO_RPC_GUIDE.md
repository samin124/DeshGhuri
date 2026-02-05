# Hono RPC Integration Guide

## Overview

DeshGhuri now supports type-safe API calls using Hono RPC alongside existing REST endpoints. This is a **hybrid approach** - RPC is added incrementally without breaking any existing functionality.

## What Was Implemented

### 1. Server Type Export
**File**: `apps/server/src/index.ts`

The server now exports its application type for compile-time type inference:

```typescript
export type AppType = typeof app;
```

This enables the frontend to know about all available routes and their types.

### 2. TypeScript Project Reference
**File**: `apps/web/tsconfig.json`

Added project reference to share types between server and frontend:

```json
{
  "references": [
    { "path": "../server" }
  ]
}
```

### 3. New Files Created

#### `apps/web/src/lib/api/rpc-client.ts`
Centralized RPC client with type inference from server routes.

#### `apps/web/src/lib/api/seller-rpc.ts`
Type-safe RPC wrapper functions for seller endpoints.

#### `apps/web/src/hooks/use-seller.ts`
React Query hooks that use RPC for data fetching.

## How to Use

### Basic RPC API Call

```typescript
import { getSellerByUserIdRpc } from '@/lib/api/seller-rpc';

async function fetchSeller(userId: string) {
  try {
    const result = await getSellerByUserIdRpc(userId);
    console.log(result.seller); // Fully typed!
  } catch (error) {
    console.error('Failed to fetch seller:', error);
  }
}
```

### React Query Hook (Recommended)

```typescript
import { useSellerByUserId } from '@/hooks/use-seller';

function SellerDashboard() {
  const userId = 'user-123';
  const { data, isLoading, error } = useSellerByUserId(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.seller?.businessName}</h1>
      <p>Status: {data?.seller?.verificationStatus}</p>
    </div>
  );
}
```

## Available RPC Endpoints

### ✅ Implemented (JSON-based)

1. **Get Seller by User ID**
   - **Endpoint**: `GET /api/seller/by-user/:userId`
   - **Function**: `getSellerByUserIdRpc(userId)`
   - **Hook**: `useSellerByUserId(userId)`

2. **Register Seller**
   - **Endpoint**: `POST /api/seller/register`
   - **Function**: `registerSellerRpc(userId)`

### 🚧 Can Be Added Later (JSON-based)

3. **Complete Onboarding**
   - Endpoint: `POST /api/seller/onboarding/complete`

4. **Get Verification Status**
   - Endpoint: `GET /api/seller/verification-status/:sellerId`

### ❌ Must Stay REST (FormData)

These endpoints use FormData and cannot use RPC:

- `POST /api/seller/documents/upload`
- `PATCH /api/seller/documents/:documentId`

FormData file uploads must continue using the existing REST approach in `apps/web/src/lib/api/seller.ts`.

## Adding New RPC Endpoints

### Step 1: Add RPC Function

Edit `apps/web/src/lib/api/seller-rpc.ts`:

```typescript
/**
 * RPC version of getVerificationStatus
 */
export async function getVerificationStatusRpc(sellerId: string) {
  const response = await sellerApi['verification-status'][':sellerId'].$get({
    param: { sellerId }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get verification status');
  }

  return await response.json();
}
```

### Step 2: Add React Query Hook

Edit `apps/web/src/hooks/use-seller.ts`:

```typescript
export function useVerificationStatus(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['seller', 'verification-status', sellerId],
    queryFn: () => {
      if (!sellerId) throw new Error('Seller ID required');
      return getVerificationStatusRpc(sellerId);
    },
    enabled: !!sellerId,
  });
}
```

### Step 3: Use in Component

```typescript
const { data } = useVerificationStatus(sellerId);
console.log(data?.seller);
console.log(data?.documents);
console.log(data?.timeline);
```

## Type Safety Benefits

### Before RPC (Manual Types)

```typescript
// No autocomplete, no type checking
const response = await fetch(`${env.VITE_SERVER_URL}/api/seller/by-user/${userId}`);
const data = await response.json(); // data is 'any'
console.log(data.seller); // No type safety!
```

### After RPC (Full Type Safety)

```typescript
// Full autocomplete and type checking
const data = await getSellerByUserIdRpc(userId);
console.log(data.seller); // TypeScript knows the exact type!
// If you typo 'seller', TypeScript will error immediately
```

## IDE Features

With RPC integrated, your IDE now provides:

1. **Autocomplete**: Type `sellerApi.` and see all available routes
2. **Type Hints**: Hover over methods to see request/response types
3. **Error Detection**: Typos and wrong types are caught immediately
4. **Go to Definition**: Jump from frontend to server route code
5. **Refactoring**: Rename a route on server, frontend updates automatically

## Migration Strategy

We're using a **gradual migration** approach:

### Phase 1 (Current): Hybrid Mode
- RPC added alongside REST
- Both work at the same time
- No breaking changes

### Phase 2 (Future): Component Migration
- Gradually update components to use RPC hooks
- Old REST functions remain as fallback
- Test thoroughly before removing REST

### Phase 3 (Future): REST Removal
- Once all components use RPC, remove old REST functions
- Keep FormData endpoints as REST forever

## File Upload Limitation

**Important**: RPC cannot handle FormData. File upload endpoints must use traditional fetch:

```typescript
// ✅ Correct: Use REST for file uploads
import { uploadDocument } from '@/lib/api/seller';
await uploadDocument(sellerId, documentType, file);

// ❌ Wrong: RPC cannot handle FormData
// This won't work!
```

## Authentication

Authentication endpoints (`/api/auth/*`) must remain REST because Better Auth requires it. Do not attempt to add RPC for auth routes.

## Testing

### Verify Types Are Working

1. Open `apps/web/src/lib/api/test-rpc-types.ts`
2. Hover over `sellerApi` - you should see route types
3. Try typing `sellerApi.` - autocomplete should appear
4. Hover over `$get` or `$post` - you should see method signatures

### Runtime Testing

```bash
# Start the server
cd apps/server
bun run dev

# In another terminal, start the frontend
cd apps/web
bun run dev

# Test the RPC hook in a component
```

## Troubleshooting

### Issue: "Cannot find module" error

**Solution**: Ensure both server and web have the same Hono version:

```bash
# Check versions
grep "hono" apps/server/package.json
grep "hono" apps/web/package.json

# Should both show: "hono": "^4.8.2"
```

### Issue: Types not updating

**Solution**: Restart your TypeScript server in your IDE:

- VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

### Issue: Build errors

**Solution**: Rebuild the project:

```bash
bun install
cd apps/web
bun run build
```

## Performance

RPC adds **zero runtime overhead**:

- Type exports are compile-time only
- RPC client uses the same HTTP requests as REST
- Bundle size increase: ~5KB (hono/client)

## Resources

- [Hono RPC Documentation](https://hono.dev/docs/guides/rpc)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Summary

✅ RPC integration complete
✅ Type safety enabled for JSON endpoints
✅ Zero breaking changes
✅ Ready for gradual migration
✅ FormData uploads still use REST
✅ Authentication unchanged
