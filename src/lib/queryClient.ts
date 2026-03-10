import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // No caching, always fetch fresh data
      gcTime: 0, // Do not keep unused data in cache
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
