import { setupWorker } from 'msw/browser';
import { sellerHandlers } from './handlers/seller-handlers';

// Combine all handlers
const handlers = [...sellerHandlers];

// Create the browser worker
export const worker = setupWorker(...handlers);

// Helper to start the worker with proper configuration
export async function startMockServiceWorker() {
  // Extra safety check for browser environment
  if (typeof window === 'undefined') {
    console.warn('[MSW] Skipping initialization in non-browser environment');
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'warn', // Warn about unhandled requests
      serviceWorker: {
        url: '/mockServiceWorker.js', // Path to service worker script
      },
      quiet: false, // Show MSW logs
    });

    console.log('[MSW] Mocking enabled - API requests will be intercepted');
  } catch (error) {
    console.error('[MSW] Failed to start:', error);
  }
}
