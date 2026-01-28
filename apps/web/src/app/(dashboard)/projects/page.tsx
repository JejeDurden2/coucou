'use client';

import Link from 'next/link';
import { Plus, Tag, ChevronRight } from 'lucide-react';

import { useProjects } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { PLAN_LIMITS, Plan } from '@coucou-ia/shared';
import { UsageNudge } from '@/components/upgrade';

export default function ProjectsPage(): React.ReactNode {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  const plan = user?.plan ?? Plan.FREE;
  const limits = PLAN_LIMITS[plan];
  const canCreateBrand = (projects?.length ?? 0) < limits.projects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-balance">Mes marques</h1>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            {projects?.length ?? 0} / {limits.projects} marque{limits.projects > 1 ? 's' : ''}
          </p>
        </div>
        {canCreateBrand ? (
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Nouvelle marque
            </Link>
          </Button>
        ) : null}
      </div>

      {!canCreateBrand ? (
        <UsageNudge
          type="project-limit"
          context={{ current: projects?.length ?? 0, max: limits.projects }}
        />
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted mt-2" />
            </div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Tag className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 font-medium text-balance">Aucune marque</h3>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Ajoutez votre première marque pour commencer à tracker votre visibilité IA.
          </p>
          <Button className="mt-4" asChild size="sm">
            <Link href="/projects/new">
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Ajouter une marque
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-card/80"
            >
              <div>
                <h3 className="font-medium text-balance">{project.brandName}</h3>
                {project.brandVariants.length > 0 ? (
                  <p className="text-sm text-muted-foreground text-pretty">
                    {project.brandVariants.join(', ')}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {project.lastScannedAt
                    ? `Analysé le ${new Date(project.lastScannedAt).toLocaleDateString('fr-FR')}`
                    : 'Jamais analysé'}
                </span>
                <ChevronRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
