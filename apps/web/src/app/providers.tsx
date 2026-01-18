'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            classNames: {
              toast: 'bg-card border-border text-foreground',
              title: 'text-foreground',
              description: 'text-muted-foreground',
              warning: '!bg-yellow-900/90 !border-yellow-600 !text-yellow-100',
              error: '!bg-red-900/90 !border-red-600 !text-red-100',
              success: '!bg-green-900/90 !border-green-600 !text-green-100',
              info: '!bg-blue-900/90 !border-blue-600 !text-blue-100',
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
