'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api-client';
import { EMAIL_ERROR_MESSAGES } from '@/lib/email-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { GoogleButton } from '@/components/ui/google-button';
import {
  PasswordInput,
  PasswordRequirement,
  usePasswordValidation,
} from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage(): React.ReactNode {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailErrorCode, setEmailErrorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = usePasswordValidation(password);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setNameError('');
    setEmailError('');
    setEmailErrorCode('');

    let hasFieldError = false;
    if (!name.trim()) {
      setNameError('Veuillez saisir votre nom.');
      hasFieldError = true;
    }
    if (!email.trim()) {
      setEmailError('Veuillez saisir votre adresse email.');
      hasFieldError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("L'adresse email n'est pas valide.");
      hasFieldError = true;
    }
    if (hasFieldError) return;

    setIsLoading(true);

    try {
      await register(email, password, name, acceptTerms);

      // Track signup conversion event
      if (typeof window !== 'undefined') {
        const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
        w.dataLayer?.push({
          event: 'conversion_event_signup',
        });
      }

      // New users always go to onboarding for plan selection and first project
      router.push('/onboarding');
    } catch (err) {
      if (err instanceof ApiClientError) {
        const emailMsg = EMAIL_ERROR_MESSAGES[err.code];
        if (emailMsg) {
          setEmailError(emailMsg);
          setEmailErrorCode(err.code);
        } else {
          setError(err.message || 'Une erreur est survenue.');
        }
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Commencez gratuitement avec 1 projet et 2 requêtes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <GoogleButton label="S'inscrire avec Google" />
              <p className="mt-2 text-center text-xs text-muted-foreground text-pretty">
                En continuant, vous acceptez les{' '}
                <Link href="/terms" className="underline hover:text-primary" target="_blank">
                  CGU
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="underline hover:text-primary" target="_blank">
                  Politique de confidentialité
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  required
                  autoComplete="name"
                />
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
              </div>
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
                    setEmailErrorCode('');
                  }}
                  required
                  autoComplete="email"
                  spellCheck={false}
                />
                {emailError && (
                  <p className="text-sm text-destructive text-pretty">
                    {emailError}
                    {emailErrorCode === 'CONFLICT' && (
                      <>
                        {' '}
                        <Link href="/login" className="underline hover:text-destructive/80">
                          Se connecter
                        </Link>{' '}
                        ou{' '}
                        <Link
                          href="/forgot-password"
                          className="underline hover:text-destructive/80"
                        >
                          réinitialiser le mot de passe
                        </Link>
                      </>
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <PasswordInput
                  id="password"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <PasswordRequirement
                      met={passwordValidation.hasMinLength}
                      text="8 caractères minimum"
                    />
                    <PasswordRequirement
                      met={passwordValidation.hasUppercase}
                      text="Une majuscule"
                    />
                    <PasswordRequirement
                      met={passwordValidation.hasLowercase}
                      text="Une minuscule"
                    />
                    <PasswordRequirement met={passwordValidation.hasNumber} text="Un chiffre" />
                  </div>
                )}
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (e.target.checked) setError('');
                  }}
                  className="mt-1 size-4 rounded border-border bg-background text-primary focus:ring-primary/50"
                  required
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  J&apos;accepte les{' '}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    Conditions Générales d&apos;Utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    Politique de confidentialité
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !acceptTerms || !passwordValidation.isValid}
              >
                {isLoading ? 'Création…' : 'Commencer gratuitement'}
              </Button>
            </form>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground text-pretty">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Gratuit, sans carte bancaire
      </p>
    </>
  );
}
