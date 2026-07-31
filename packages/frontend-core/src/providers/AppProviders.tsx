import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { OrganizationProvider } from './OrganizationProvider';
import { Toaster } from '@workspace/ui';

import { ApiError } from '@workspace/api-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          {children}
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
