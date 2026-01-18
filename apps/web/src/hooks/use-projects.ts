'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateProjectInput, UpdateProjectInput } from '@coucou-ia/shared';
import { apiClient, ApiClientError } from '@/lib/api-client';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => apiClient.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => apiClient.createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet créé', {
        description: `Le projet "${project.name}" a été créé avec succès.`,
      });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.code === 'PLAN_LIMIT_EXCEEDED') {
          toast.error('Limite atteinte', {
            description: 'Passez à un plan supérieur pour créer plus de projets.',
          });
        } else {
          toast.error('Erreur', { description: error.message });
        }
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectInput) => apiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      toast.success('Projet mis à jour');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet supprimé');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}
