# MSW API Mocking

This directory contains Mock Service Worker (MSW) setup for API mocking during development.

## Usage

### Enable Mocking

Set in `apps/web/.env`:

```
VITE_API_MOCKING_ENABLED=true
```

### Disable Mocking

```
VITE_API_MOCKING_ENABLED=false
```

Or comment out the line / delete the variable.

## Structure

```
src/mocks/
├── index.ts                  # Initialization entry point
├── browser.ts                # MSW browser worker setup
├── handlers/                 # Request handlers
│   └── seller-handlers.ts    # Seller API mocks
└── data/                     # Mock data
    └── seller-data.ts        # Seller mock data
```

## Adding New Mocks

1. Create handler in `handlers/`:

```typescript
import { http, HttpResponse } from 'msw';

export const myHandlers = [
  http.get('/api/my-endpoint', () => {
    return HttpResponse.json({ data: 'mocked' });
  }),
];
```

2. Add to `browser.ts`:

```typescript
import { myHandlers } from './handlers/my-handlers';

const handlers = [...sellerHandlers, ...myHandlers];
```

## Mocked Endpoints

- `POST /api/seller/register`
- `GET /api/seller/by-user/:userId`
- `POST /api/seller/onboarding/complete`
- `GET /api/seller/verification-status/:sellerId`
- `POST /api/seller/documents/upload`
- `PATCH /api/seller/documents/:documentId`
- `GET /api/seller/test-cloudinary`

## Features

- ✅ Realistic network delays
- ✅ Proper error responses
- ✅ FormData support for file uploads
- ✅ Request validation
- ✅ Production-safe (tree-shaken out)

## Debugging

Check browser console for MSW logs:

- `[MSW] Mocking enabled` - MSW is active
- `[MSW] GET /api/...` - Request intercepted
- `[MSW] Warning: captured a request without a matching request handler` - Add handler

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Browser Integration](https://mswjs.io/docs/integrations/browser)
