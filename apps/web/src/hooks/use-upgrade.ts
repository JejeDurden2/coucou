'use client';

import { useContext } from 'react';
import { UpgradeModalContext } from '@/components/upgrade/upgrade-modal-context';

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return context;
}

/**
 * Fire a GA4 custom event for upgrade funnel tracking.
 * No-op if gtag is not loaded yet.
 */
export function trackUpgradeEvent(
  action: 'modal_open' | 'modal_close' | 'cta_click' | 'checkout_start',
  feature: string,
): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as Record<string, unknown>).gtag;
  if (typeof gtag === 'function') {
    (gtag as (...args: unknown[]) => void)('event', `upgrade_${action}`, {
      event_category: 'upgrade',
      event_label: feature,
    });
  }
}
