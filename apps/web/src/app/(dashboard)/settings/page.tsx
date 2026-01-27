'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { EMAIL_ERROR_MESSAGES } from '@/lib/email-errors';
import { useSubscription } from '@/hooks/use-billing';
import { useUpdateEmailNotifications } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DeleteAccountModal } from '@/components/features/settings';
import { cn } from '@/lib/utils';

export default function SettingsPage(): React.ReactNode {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const updateEmailNotifications = useUpdateEmailNotifications();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasActiveSubscription =
    user?.plan !== Plan.FREE &&
    subscription?.status === 'ACTIVE' &&
    !subscription?.cancelAtPeriodEnd;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setEmailError('');

    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== user?.name) updates.name = name;
      if (!user?.isOAuthUser && email !== user?.email) updates.email = email;

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'success', text: 'Aucune modification' });
        setIsLoading(false);
        return;
      }

      await apiClient.updateProfile(updates);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (err) {
      if (err instanceof ApiClientError) {
        const emailMsg = EMAIL_ERROR_MESSAGES[err.code];
        if (emailMsg) {
          setEmailError(emailMsg);
        } else {
          setMessage({
            type: 'error',
            text: err.message || 'Erreur lors de la mise à jour du profil',
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportData(): Promise<void> {
    setIsExporting(true);
    setMessage(null);

    try {
      const data = await apiClient.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coucou-ia-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Données exportées avec succès' });
    } catch {
      setMessage({ type: 'error', text: "Erreur lors de l'export des données" });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-balance">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1 text-pretty">
          Gérez les informations de votre compte
        </p>
      </div>

      {message && (
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20',
          )}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase mb-4 text-balance">
          Profil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            {user?.isOAuthUser ? (
              <>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="bg-muted/50"
                  autoComplete="email"
                />
                <p className="text-xs text-muted-foreground text-pretty">
                  L&apos;email ne peut pas être modifié pour les comptes liés à Google
                </p>
              </>
            ) : (
              <>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  spellCheck={false}
                />
                {emailError && <p className="text-sm text-destructive text-pretty">{emailError}</p>}
              </>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              autoComplete="name"
            />
          </div>
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase mb-4 text-balance">
          Notifications par email
        </h2>
        <p className="text-sm text-muted-foreground mb-4 text-pretty">
          Recevez des emails pour rester informé de votre visibilité IA.
        </p>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-pretty">Activer les notifications email</p>
            <p className="text-sm text-muted-foreground text-pretty">
              {user?.plan === Plan.FREE
                ? "Alertes d'inactivité quand vous n'avez pas lancé d'analyse depuis 14 jours."
                : 'Résultats de vos analyses automatiques.'}
            </p>
          </div>
          <Switch
            checked={user?.emailNotificationsEnabled ?? true}
            onCheckedChange={(checked) => updateEmailNotifications.mutate(checked)}
            disabled={updateEmailNotifications.isPending}
            aria-label="Activer les notifications email"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-pretty">
          Vous pouvez aussi vous désinscrire via le lien en bas de nos emails.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase mb-4 text-balance">
          Plan actuel
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-pretty">{user?.plan}</p>
            <p className="text-sm text-muted-foreground text-pretty">
              {user?.plan === Plan.FREE ? 'Fonctionnalités limitées' : 'Accès complet'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/billing">Gérer</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase mb-4 text-balance">
          Vos données (RGPD)
        </h2>
        <p className="text-sm text-muted-foreground mb-4 text-pretty">
          Conformément au RGPD, vous pouvez exporter ou supprimer vos données à tout moment.
          Consultez notre{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting}>
            <Download className="mr-2 size-4" aria-hidden="true" />
            {isExporting ? 'Export…' : 'Exporter mes données'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-sm font-medium text-destructive uppercase mb-4 text-balance">
          Zone de danger
        </h2>
        <p className="text-sm text-muted-foreground mb-4 text-pretty">
          La suppression de votre compte est irréversible. Toutes vos données (projets, prompts,
          analyses) seront définitivement supprimées.
          {hasActiveSubscription && <> Votre abonnement sera annulé et remboursé au prorata.</>}
        </p>
        <DeleteAccountModal
          userPlan={user?.plan ?? Plan.FREE}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>
    </div>
  );
}
