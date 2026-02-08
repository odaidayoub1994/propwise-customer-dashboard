'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { makeQueryClient } from '@/lib/react-query';
import { AdminProvider } from '@/context/AdminContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AdminProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AdminProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
