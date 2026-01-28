'use client';

import { memo } from 'react';
import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUpgradeModal } from '@/hooks/use-upgrade';
import { UPGRADE_FEATURES, type UpgradeFeature } from './upgrade-config';
import { StatsPreview } from './feature-preview/stats-preview';
import { CompetitorsPreview } from './feature-preview/competitors-preview';
import { RecommendationsPreview } from './feature-preview/recommendations-preview';
import { SentimentPreview } from './feature-preview/sentiment-preview';

const PREVIEW_COMPONENTS: Record<UpgradeFeature, React.ComponentType> = {
  stats: StatsPreview,
  competitors: CompetitorsPreview,
  recommendations: RecommendationsPreview,
  sentiment: SentimentPreview,
};

interface FeatureLockedBannerProps {
  feature: UpgradeFeature;
}

export const FeatureLockedBanner = memo(function FeatureLockedBanner({
  feature,
}: FeatureLockedBannerProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const config = UPGRADE_FEATURES[feature];
  const PreviewComponent = PREVIEW_COMPONENTS[feature];
  const HintIcon = config.icon;

  return (
    <div className="relative">
      {/* Blurred preview with sample data */}
      <div
        className="absolute inset-0 opacity-30 blur-[2px] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <PreviewComponent />
      </div>

      {/* Lock overlay */}
      <Card className="relative z-10 mx-auto max-w-md mt-16 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-balance">{config.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{config.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HintIcon className="size-4" aria-hidden="true" />
              <span>{config.hint}</span>
            </div>
            <Button className="w-full" onClick={() => openUpgradeModal(feature)}>
              Débloquer avec Solo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
