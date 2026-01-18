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
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
            classNames: {
              warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
              error: 'bg-red-900/90 border-red-700 text-red-100',
              success: 'bg-green-900/90 border-green-700 text-green-100',
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
