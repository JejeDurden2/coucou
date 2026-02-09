import { BarChart3 } from 'lucide-react';
import {
  type DashboardStats,
  type Plan,
  getLockedProvidersForPlan,
  getProvidersForPlan,
} from '@coucou-ia/shared';

import { StatCard } from '@/components/features/dashboard/stat-card';
import { BentoGrid, BentoItem } from '@/components/dashboard/bento-grid';
import { ProviderStatCard } from './provider-stat-card';
import { LockedProviderCard } from './locked-provider-card';
import { PositionCard } from './position-card';
import { SentimentBentoCard } from './sentiment-card';

interface KpiBentoSectionProps {
  stats: DashboardStats | undefined;
  projectId: string;
  userPlan: Plan;
  onNavigateToSentiment: () => void;
}

export function KpiBentoSection({
  stats,
  projectId,
  userPlan,
  onNavigateToSentiment,
}: KpiBentoSectionProps): React.ReactNode {
  const allowedProviders = getProvidersForPlan(userPlan);
  const breakdownMap = new Map((stats?.breakdown ?? []).map((b) => [b.provider, b.averageRank]));
  const lockedProviders = getLockedProvidersForPlan(userPlan);

  return (
    <BentoGrid>
      <BentoItem className="lg:col-span-2 lg:row-span-2">
        <PositionCard
          averageRank={stats?.averageRank ?? null}
          trend={stats?.trend}
          sparklineData={stats?.trends?.averageRank}
        />
      </BentoItem>

      {allowedProviders.map((provider) => (
        <BentoItem key={provider}>
          <ProviderStatCard provider={provider} averageRank={breakdownMap.get(provider) ?? null} />
        </BentoItem>
      ))}

      {lockedProviders.map((provider) => (
        <BentoItem key={provider}>
          <LockedProviderCard provider={provider} />
        </BentoItem>
      ))}

      <BentoItem>
        <StatCard
          icon={BarChart3}
          label="Total analyses"
          value={stats?.totalScans?.toString() ?? '0'}
          tooltipTerm="scan"
        />
      </BentoItem>

      <BentoItem className="lg:col-span-2">
        <SentimentBentoCard
          projectId={projectId}
          userPlan={userPlan}
          onNavigate={onNavigateToSentiment}
          className="h-full"
        />
      </BentoItem>
    </BentoGrid>
  );
}
