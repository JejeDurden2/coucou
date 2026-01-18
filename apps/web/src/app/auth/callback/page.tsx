'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loadUser } = useAuth();

  useEffect(() => {
    // Cookies are already set by the backend, just load the user
    loadUser()
      .then(() => {
        router.replace('/projects');
      })
      .catch(() => {
        router.replace('/login?error=auth_failed');
      });
  }, [loadUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
