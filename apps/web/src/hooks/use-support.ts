'use client';

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateSupportRequestInput, SupportRequestResponse } from '@coucou-ia/shared';

import { apiClient, ApiClientError } from '@/lib/api-client';

export function useSendSupportRequest(): UseMutationResult<
  SupportRequestResponse,
  Error,
  CreateSupportRequestInput
> {
  return useMutation({
    mutationFn: (data: CreateSupportRequestInput) => apiClient.sendSupportRequest(data),
    onSuccess: () => {
      toast.success('Demande envoyée !', {
        description: 'Nous vous répondons rapidement.',
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Une erreur est survenue lors de l'envoi de votre demande.";
      toast.error('Erreur', { description: message });
    },
  });
}
