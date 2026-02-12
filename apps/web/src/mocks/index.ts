import { env } from '@DeshGhuri/env/web';

export async function initMocks() {
  // Only load MSW in browser environment when mocking is enabled
  if (typeof window !== 'undefined' && env.VITE_API_MOCKING_ENABLED) {
    const { startMockServiceWorker } = await import('./browser');
    await startMockServiceWorker();
  }
}
