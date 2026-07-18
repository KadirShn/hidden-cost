import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      staleTime: 30_000,
      retry: false,
    },
    mutations: {
      networkMode: 'always',
      retry: false,
    },
  },
});
