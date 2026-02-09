'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { makeQueryClient } from '@/lib/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdminProvider } from '@/context/AdminContext';
import { SocketProvider } from '@/context/SocketContext';
import { AppLayout } from '@/components/AppLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AdminProvider>
            <SocketProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster richColors position="top-right" />
            </SocketProvider>
          </AdminProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
