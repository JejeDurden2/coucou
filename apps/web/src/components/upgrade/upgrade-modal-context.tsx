'use client';

import { createContext, useCallback, useMemo, useState } from 'react';
import type { UpgradeFeature } from './upgrade-config';
import { UpgradeModal } from './upgrade-modal';

export interface UpgradeModalContextValue {
  openUpgradeModal: (feature: UpgradeFeature) => void;
  trackLockedTabClick: (feature: UpgradeFeature) => void;
  getClickCount: (feature: UpgradeFeature) => number;
}

export const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

const STORAGE_KEY = 'upgrade-locked-clicks';

function readClickCounts(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeClickCounts(counts: Record<string, number>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    // sessionStorage unavailable (SSR, incognito overflow)
  }
}

interface UpgradeModalProviderProps {
  children: React.ReactNode;
}

export function UpgradeModalProvider({ children }: UpgradeModalProviderProps): React.ReactNode {
  const [openFeature, setOpenFeature] = useState<UpgradeFeature | null>(null);

  const openUpgradeModal = useCallback((feature: UpgradeFeature) => {
    setOpenFeature(feature);
  }, []);

  const trackLockedTabClick = useCallback((feature: UpgradeFeature) => {
    const counts = readClickCounts();
    counts[feature] = (counts[feature] ?? 0) + 1;
    writeClickCounts(counts);
  }, []);

  const getClickCount = useCallback((feature: UpgradeFeature): number => {
    return readClickCounts()[feature] ?? 0;
  }, []);

  const value = useMemo(
    () => ({ openUpgradeModal, trackLockedTabClick, getClickCount }),
    [openUpgradeModal, trackLockedTabClick, getClickCount],
  );

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
      <UpgradeModal
        feature={openFeature}
        onOpenChange={(open) => {
          if (!open) setOpenFeature(null);
        }}
      />
    </UpgradeModalContext.Provider>
  );
}
