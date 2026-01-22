'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { apiClient, ApiClientError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface DeleteAccountInput {
  confirmation: string;
}

export function useDeleteAccount() {
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: ({ confirmation }: DeleteAccountInput) => apiClient.deleteAccount(confirmation),
    onSuccess: () => {
      logout();
      router.push('/?deleted=true');
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Erreur lors de la suppression du compte';
      throw new Error(message);
    },
  });
}
