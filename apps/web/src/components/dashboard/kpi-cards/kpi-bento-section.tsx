import { MessageSquare, BarChart3 } from 'lucide-react';
import {
  LLMProvider,
  type DashboardStats,
  type Plan,
  getModelDisplayName,
} from '@coucou-ia/shared';

import { StatCard } from '@/components/features/dashboard/stat-card';
import { BentoGrid, BentoItem } from '@/components/dashboard/bento-grid';
import { ClaudeModelsCard } from './claude-models-card';
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
  const modelBreakdown = stats?.modelBreakdown ?? [];
  const openaiModels: typeof modelBreakdown = [];
  const claudeModels: typeof modelBreakdown = [];
  for (const m of modelBreakdown) {
    if (m.provider === LLMProvider.OPENAI) openaiModels.push(m);
    else if (m.provider === LLMProvider.ANTHROPIC) claudeModels.push(m);
  }

  return (
    <BentoGrid>
      <BentoItem className="lg:col-span-2 lg:row-span-2">
        <PositionCard
          averageRank={stats?.averageRank ?? null}
          trend={stats?.trend}
          sparklineData={stats?.trends?.averageRank}
        />
      </BentoItem>

      {openaiModels.map((model) => (
        <BentoItem key={model.model}>
          <StatCard
            icon={MessageSquare}
            label={getModelDisplayName(model.model)}
            value={model.averageRank}
            podiumStyle
          />
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

      <BentoItem className="lg:col-span-2">
        <ClaudeModelsCard models={claudeModels} />
      </BentoItem>
    </BentoGrid>
  );
}
