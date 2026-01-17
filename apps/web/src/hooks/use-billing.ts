'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: (returnUrl: string) => apiClient.createPortal(returnUrl),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
