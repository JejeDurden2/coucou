'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Settings, CreditCard, HelpCircle, ChevronDown, Zap } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { useProjects } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UpgradeModalProvider } from '@/components/upgrade';

const PROJECT_ID_REGEX = /\/projects\/([^/]+)/;

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps): React.ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { data: projects } = useProjects();

  const projectIdMatch = pathname.match(PROJECT_ID_REGEX);
  const currentProjectId = projectIdMatch?.[1];
  const currentProject = projects?.find((p) => p.id === currentProjectId);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement&hellip;</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  function handleLogout(): void {
    logout();
    router.push('/');
  }

  const hasProjects = projects && projects.length > 0;

  return (
    <UpgradeModalProvider>
      <div className="min-h-dvh flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-6">
              <Link
                href="/projects"
                className="flex items-center"
                aria-label="Accueil - Liste des marques"
              >
                <Logo size="sm" />
              </Link>

              {hasProjects && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-sm font-medium max-w-[200px]"
                      aria-label="Sélectionner une marque"
                    >
                      <span className="truncate">
                        {currentProject?.brandName ?? 'Sélectionner une marque'}
                      </span>
                      <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        asChild
                        className={cn(currentProjectId === project.id && 'bg-accent/10')}
                      >
                        <Link href={`/projects/${project.id}`}>
                          <span className="font-medium">{project.brandName}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/projects/new">
                        <Zap className="mr-2 size-4" aria-hidden="true" />
                        Nouvelle marque
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" aria-label="Menu utilisateur">
                    <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm">{user?.name}</span>
                    <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-pretty">{user?.name}</p>
                    <p className="text-xs text-muted-foreground text-pretty">{user?.email}</p>
                    <p className="text-xs text-primary mt-1 text-pretty">Plan {user?.plan}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 size-4" aria-hidden="true" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard className="mr-2 size-4" aria-hidden="true" />
                      Facturation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/support">
                      <HelpCircle className="mr-2 size-4" aria-hidden="true" />
                      Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 size-4" aria-hidden="true" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</div>
        </main>
      </div>
    </UpgradeModalProvider>
  );
}
