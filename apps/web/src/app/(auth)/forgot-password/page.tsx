'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

const RESEND_COOLDOWN_SECONDS = 30;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendResetEmail = useCallback(async () => {
    await apiClient.forgotPassword(email);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Veuillez saisir votre adresse email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("L'adresse email n'est pas valide.");
      return;
    }

    setIsLoading(true);

    try {
      await sendResetEmail();
      setIsSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await sendResetEmail();
    } catch {
      // Silently fail — rate limited or network error
    } finally {
      setIsResending(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-12 rounded-full bg-success/10 flex items-center justify-center">
            <Mail className="size-6 text-success" />
          </div>
          <CardTitle>Vérifiez votre boîte mail</CardTitle>
          <CardDescription>
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un email
            avec un lien pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4 text-pretty">
            L&apos;email peut prendre quelques minutes à arriver. Pensez à vérifier vos spams.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={resendCooldown > 0 || isResending}
              onClick={handleResend}
            >
              {isResending
                ? 'Envoi en cours…'
                : resendCooldown > 0
                  ? `Renvoyer l'email (${resendCooldown}s)`
                  : "Renvoyer l'email"}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 size-4" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
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
        <CardTitle>Mot de passe oublié ?</CardTitle>
        <CardDescription>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de
          passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Envoi en cours…' : 'Envoyer le lien'}
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
