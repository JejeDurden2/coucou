'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  PasswordInput,
  PasswordRequirement,
  usePasswordValidation,
} from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient, ApiClientError } from '@/lib/api-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordValidation = usePasswordValidation(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isPasswordValid = passwordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères requis.');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.resetPassword(token!, password);
      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : null;
      setError(message ?? 'Ce lien est invalide ou a expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="size-6 text-destructive" />
          </div>
          <CardTitle>Lien invalide</CardTitle>
          <CardDescription>Ce lien de réinitialisation est invalide ou a expiré.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password">
            <Button className="w-full">Demander un nouveau lien</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <CardTitle>Mot de passe modifié</CardTitle>
          <CardDescription>
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous
            connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo size="lg" />
        </div>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Nouveau mot de passe
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <div className="space-y-1 pt-2">
              <PasswordRequirement
                met={passwordValidation.hasMinLength}
                text="8 caractères minimum"
              />
              <PasswordRequirement met={passwordValidation.hasUppercase} text="Une majuscule" />
              <PasswordRequirement met={passwordValidation.hasLowercase} text="Une minuscule" />
              <PasswordRequirement met={passwordValidation.hasNumber} text="Un chiffre" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword.length > 0 && (
              <PasswordRequirement met={passwordsMatch} text="Les mots de passe correspondent" />
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
          >
            {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground text-pretty">
          <Link href="/login" className="text-primary hover:underline">
            <ArrowLeft className="inline mr-1 size-3" />
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader className="text-center space-y-4">
            <Skeleton variant="circular" className="mx-auto size-12" />
            <Skeleton variant="text" className="mx-auto w-48 h-6" />
            <Skeleton variant="text" className="mx-auto w-64 h-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="text" className="w-40 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <Skeleton className="w-full h-10" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
