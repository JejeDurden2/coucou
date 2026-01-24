'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, ApiClientError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export function useUpdateEmailNotifications() {
  const { loadUser } = useAuth();

  return useMutation({
    mutationFn: (enabled: boolean) => apiClient.updateEmailNotifications(enabled),
    onSuccess: () => {
      loadUser();
      toast.success('Préférences enregistrées');
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Erreur lors de la sauvegarde des préférences';
      toast.error('Erreur', { description: message });
    },
  });
}
