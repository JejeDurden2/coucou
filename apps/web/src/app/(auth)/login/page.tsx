'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { GoogleButton } from '@/components/ui/google-button';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage(): React.ReactNode {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let hasFieldError = false;
    if (!email.trim()) {
      setEmailError('Veuillez saisir votre adresse email.');
      hasFieldError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("L'adresse email n'est pas valide.");
      hasFieldError = true;
    }
    if (!password) {
      setPasswordError('Veuillez saisir votre mot de passe.');
      hasFieldError = true;
    }
    if (hasFieldError) return;

    setIsLoading(true);

    try {
      const userData = await login(email, password);
      // Redirect to onboarding if user has no projects, otherwise to projects
      router.push(userData.projectCount === 0 ? '/onboarding' : '/projects');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo size="lg" />
        </div>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connectez-vous pour accéder à votre dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <GoogleButton label="Continuer avec Google" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}{' '}
                <Link href="/forgot-password" className="underline hover:text-destructive/80">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                required
                autoComplete="email"
                spellCheck={false}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                required
                autoComplete="current-password"
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground text-pretty">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
