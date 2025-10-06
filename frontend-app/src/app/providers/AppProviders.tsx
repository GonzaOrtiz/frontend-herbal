import React from 'react';
import { QueryClientProvider, createQueryClient } from '@/lib/query/QueryClient';

const queryClient = createQueryClient({ staleTime: 30_000 });

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
