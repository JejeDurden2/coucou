'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function AuthCallbackContent() {
  const router = useRouter();
  const { loadUser } = useAuth();

  useEffect(() => {
    // Cookies are already set by the backend, just load the user
    loadUser()
      .then((userData) => {
        // Redirect to onboarding if user has no projects, otherwise to projects
        const redirectPath = userData?.projectCount === 0 ? '/onboarding' : '/projects';
        router.replace(redirectPath);
      })
      .catch(() => {
        router.replace('/login?error=auth_failed');
      });
  }, [loadUser, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <div className="mb-4 size-8 animate-spin motion-reduce:animate-none rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="text-center">
            <div className="mb-4 size-8 animate-spin motion-reduce:animate-none rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Connexion en cours...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
