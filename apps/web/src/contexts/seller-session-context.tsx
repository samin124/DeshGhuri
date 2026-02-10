import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getCurrentSeller, logoutSeller } from '@/lib/api/seller-dashboard';
import { authClient } from '@/lib/auth-client';

interface SellerSession {
  sellerId: string;
  businessName: string;
  email: string;
  userId: string;
}

interface SellerSessionContextValue {
  seller: SellerSession | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const SellerSessionContext = createContext<SellerSessionContextValue | undefined>(undefined);

export function SellerSessionProvider({ children }: { children: React.ReactNode }) {
  const [seller, setSeller] = useState<SellerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchSeller = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCurrentSeller();
      setSeller(data);
    } catch (err) {
      // Don't log errors for unauthorized users (401/403) - this is expected for non-sellers
      // Only log unexpected errors
      if (err instanceof Error && !err.message.includes('Unauthorized') && !err.message.includes('Forbidden')) {
        console.error('Failed to fetch seller session:', err);
      }
      setSeller(null);
      setError(null); // Clear error for non-sellers
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeller();
  }, [fetchSeller]);

  const logout = useCallback(async () => {
    try {
      // Clear seller-specific session
      await logoutSeller();

      // Clear Better Auth session (main authentication)
      await authClient.signOut();

      setSeller(null);
      navigate({ to: '/' });
    } catch (err) {
      console.error('Failed to logout:', err);
      throw err;
    }
  }, [navigate]);

  const refetch = useCallback(async () => {
    await fetchSeller();
  }, [fetchSeller]);

  return (
    <SellerSessionContext.Provider value={{ seller, isLoading, error, logout, refetch }}>
      {children}
    </SellerSessionContext.Provider>
  );
}

export function useSellerSession() {
  const context = useContext(SellerSessionContext);
  if (context === undefined) {
    throw new Error('useSellerSession must be used within a SellerSessionProvider');
  }
  return context;
}
