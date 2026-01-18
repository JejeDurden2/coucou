'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage(): React.ReactNode {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setMessage({ type: 'error', text: 'Erreur lors de l\'export des données' });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    if (deleteConfirmText !== 'SUPPRIMER') return;

    setIsDeleting(true);
    setMessage(null);

    try {
      await apiClient.deleteAccount();
      logout();
      router.push('/');
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' });
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les informations de votre compte
        </p>
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
            <p className="text-xs text-muted-foreground">
              L&apos;email ne peut pas être modifié
            </p>
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
              {user?.plan === 'FREE' ? 'Fonctionnalités limitées' : 'Accès complet'}
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
          </Link>.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {isExporting ? 'Export…' : 'Exporter mes données'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-sm font-medium text-red-500 uppercase tracking-wide mb-4">
          Zone de danger
        </h2>
        {!showDeleteConfirm ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de votre compte est irréversible. Toutes vos données
              (projets, prompts, scans) seront définitivement supprimées.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Supprimer mon compte
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-medium text-red-500">
                  Êtes-vous sûr de vouloir supprimer votre compte ?
                </p>
                <p className="text-muted-foreground mt-1">
                  Cette action est irréversible. Tapez{' '}
                  <span className="font-mono font-bold text-red-500">SUPPRIMER</span>{' '}
                  pour confirmer.
                </p>
              </div>
            </div>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER pour confirmer"
              className="border-red-500/30"
              aria-label="Confirmation de suppression"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || isDeleting}
              >
                {isDeleting ? 'Suppression…' : 'Confirmer la suppression'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
