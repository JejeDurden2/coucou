'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement profile update
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les informations de votre compte
        </p>
      </div>

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
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
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
            <a href="/billing">Gérer</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
