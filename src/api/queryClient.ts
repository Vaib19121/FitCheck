import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Client errors (4xx) won't succeed on retry.
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
