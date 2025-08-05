"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

function LoadingProviderInner({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auto-hide loading when navigation completes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Emergency timeout to hide loading after 5 seconds
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('Loading took too long, hiding spinner');
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Listen for navigation events to show loading
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          
          // Only show loading for internal navigation
          if (url.origin === window.location.origin && url.pathname !== pathname) {
            setIsLoading(true);
          }
        } catch (err) {
          console.warn('Error setting up navigation loading:', err);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  const value = {
    isLoading,
    setLoading: setIsLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <LoadingSpinner />}
    </LoadingContext.Provider>
  );
}

export default function LoadingProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  );
} 