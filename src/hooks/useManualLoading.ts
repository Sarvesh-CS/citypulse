import { useState } from 'react';
import { useLoading } from '@/components/LoadingProvider';

interface UseManualLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useManualLoading(): UseManualLoadingReturn {
  const [localLoading, setLocalLoading] = useState(false);
  const { setLoading: setGlobalLoading } = useLoading();

  const startLoading = () => {
    setLocalLoading(true);
    setGlobalLoading(true);
  };

  const stopLoading = () => {
    setLocalLoading(false);
    setGlobalLoading(false);
  };

  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading: localLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
} 