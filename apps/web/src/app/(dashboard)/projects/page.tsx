'use client';

import Link from 'next/link';
import { Plus, FolderKanban, BarChart3 } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { PLAN_LIMITS, Plan } from '@coucou-ia/shared';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  const plan = user?.plan ?? Plan.FREE;
  const limits = PLAN_LIMITS[plan];
  const canCreateProject = (projects?.length ?? 0) < limits.projects;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes projets</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos projets de tracking de visibilité IA
          </p>
        </div>
        {canCreateProject && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nouveau projet
            </Link>
          </Button>
        )}
      </div>

      {!canCreateProject && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">
            Vous avez atteint la limite de {limits.projects} projet
            {limits.projects > 1 ? 's' : ''} pour votre plan {plan}.{' '}
            <Link href="/settings/billing" className="underline">
              Passez à un plan supérieur
            </Link>{' '}
            pour créer plus de projets.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 rounded bg-slate-700" />
                <div className="h-4 w-48 rounded bg-slate-700 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-full rounded bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-medium">Aucun projet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez votre premier projet pour commencer à tracker la visibilité de
            votre marque dans les réponses IA.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Créer mon premier projet
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="outline">{project.brandName}</Badge>
                  </div>
                  <CardDescription>
                    {project.brandVariants.length > 0 && (
                      <span>
                        Variantes: {project.brandVariants.join(', ')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {project.lastScannedAt
                          ? `Dernier scan: ${new Date(project.lastScannedAt).toLocaleDateString('fr-FR')}`
                          : 'Jamais scanné'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
