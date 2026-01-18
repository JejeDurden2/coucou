'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, ApiClientError } from '@/lib/api-client';

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
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur de paiement', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Impossible de créer la session de paiement.' });
      }
    },
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: (returnUrl: string) => apiClient.createPortal(returnUrl),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Impossible d\'accéder au portail de facturation.' });
      }
    },
  });
}
