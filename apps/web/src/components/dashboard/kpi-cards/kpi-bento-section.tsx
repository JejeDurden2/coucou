import { BarChart3 } from 'lucide-react';
import { type DashboardStats, type Plan } from '@coucou-ia/shared';

import { StatCard } from '@/components/features/dashboard/stat-card';
import { BentoGrid, BentoItem } from '@/components/dashboard/bento-grid';
import { ProviderStatCard } from './provider-stat-card';
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
  const providerBreakdown = stats?.breakdown ?? [];

  return (
    <BentoGrid>
      <BentoItem className="lg:col-span-2 lg:row-span-2">
        <PositionCard
          averageRank={stats?.averageRank ?? null}
          trend={stats?.trend}
          sparklineData={stats?.trends?.averageRank}
        />
      </BentoItem>

      {providerBreakdown.map((provider) => (
        <BentoItem key={provider.provider}>
          <ProviderStatCard provider={provider.provider} averageRank={provider.averageRank} />
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
