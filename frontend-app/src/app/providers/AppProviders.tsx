import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider, createQueryClient } from '@/lib/query/QueryClient';
import { appTheme } from '@/theme';

const queryClient = createQueryClient({ staleTime: 30_000 });

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  </QueryClientProvider>
);
