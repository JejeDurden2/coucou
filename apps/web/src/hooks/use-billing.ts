'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, ApiClientError } from '@/lib/api-client';

function handleMutationError(error: unknown, fallbackMessage: string): void {
  const description = error instanceof ApiClientError ? error.message : fallbackMessage;
  toast.error('Erreur', { description });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: ({
      plan,
      successUrl,
      cancelUrl,
    }: {
      plan: string;
      successUrl: string;
      cancelUrl: string;
    }) => apiClient.createCheckout(plan, successUrl, cancelUrl),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => handleMutationError(error, 'Impossible de créer la session de paiement.'),
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: (returnUrl: string) => apiClient.createPortal(returnUrl),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) =>
      handleMutationError(error, "Impossible d'accéder au portail de facturation."),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.getSubscription(),
  });
}

export function useDowngrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.downgradeSubscription(),
    onSuccess: (data) => {
      toast.success('Annulation programmée', { description: data.message });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => handleMutationError(error, "Impossible d'annuler l'abonnement."),
  });
}

export function useCancelDowngrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.cancelDowngrade(),
    onSuccess: (data) => {
      toast.success('Abonnement réactivé', { description: data.message });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => handleMutationError(error, "Impossible de réactiver l'abonnement."),
  });
}
