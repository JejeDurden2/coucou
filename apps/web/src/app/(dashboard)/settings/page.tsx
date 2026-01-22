'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useSubscription } from '@/hooks/use-billing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteAccountModal } from '@/components/features/settings';

export default function SettingsPage(): React.ReactNode {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const [name, setName] = useState(user?.name ?? '');
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

    try {
      await apiClient.updateProfile(name);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
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
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez les informations de votre compte</p>
      </div>

      {message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Profil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié</p>
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
            />
          </div>
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Plan actuel
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user?.plan}</p>
            <p className="text-sm text-muted-foreground">
              {user?.plan === Plan.FREE ? 'Fonctionnalités limitées' : 'Accès complet'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/billing">Gérer</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Vos données (RGPD)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Conformément au RGPD, vous pouvez exporter ou supprimer vos données à tout moment.
          Consultez notre{' '}
          <Link href="/privacy" className="text-cyan-400 hover:underline">
            Politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {isExporting ? 'Export…' : 'Exporter mes données'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-sm font-medium text-destructive uppercase tracking-wide mb-4">
          Zone de danger
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          La suppression de votre compte est irréversible. Toutes vos données (projets, prompts,
          scans) seront définitivement supprimées.
          {hasActiveSubscription && (
            <> Votre abonnement sera annulé et remboursé au prorata.</>
          )}
        </p>
        <DeleteAccountModal
          userPlan={user?.plan ?? Plan.FREE}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>
    </div>
  );
}
