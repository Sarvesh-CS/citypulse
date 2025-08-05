"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingSpinner from './LoadingSpinner'

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Listen for link clicks
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);
          
          // Check if it's internal navigation to a different page
          if (url.origin === currentUrl.origin && 
              url.pathname !== currentUrl.pathname &&
              !link.href.startsWith('#') && 
              !link.href.includes('mailto:') && 
              !link.href.includes('tel:')) {
            
            setIsNavigating(true);
            setIsLoading(true);
          }
        } catch (error) {
          // Ignore invalid URLs
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // Hide loading when navigation completes
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isNavigating]);

  // Emergency timeout
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setIsNavigating(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      <LoadingSpinner isVisible={isLoading} />
    </LoadingContext.Provider>
  );
} 