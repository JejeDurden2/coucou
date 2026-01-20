'use client';

import { memo } from 'react';
import { Plan } from '@coucou-ia/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DatePreset = '7d' | '30d' | '90d' | 'all';

interface DateRangePickerProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
  userPlan: Plan;
}

const presets: Array<{ value: DatePreset; label: string; days: number | null }> = [
  { value: '7d', label: '7 jours', days: 7 },
  { value: '30d', label: '30 jours', days: 30 },
  { value: '90d', label: '90 jours', days: 90 },
  { value: 'all', label: 'Tout', days: null },
];

export const DateRangePicker = memo(function DateRangePicker({
  value,
  onChange,
  userPlan,
}: DateRangePickerProps) {
  const maxDays = userPlan === Plan.SOLO ? 30 : null;

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {presets.map((preset) => {
        const isDisabled = maxDays !== null && preset.days !== null && preset.days > maxDays;
        const isSelected = value === preset.value;

        return (
          <Button
            key={preset.value}
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={() => onChange(preset.value)}
            className={cn(
              'text-xs h-7 px-2.5',
              isSelected && 'bg-background shadow-sm text-foreground',
              !isSelected && 'text-muted-foreground hover:text-foreground',
              isDisabled && 'opacity-50 cursor-not-allowed',
            )}
            title={isDisabled ? 'Passez à PRO pour accéder à plus d\'historique' : undefined}
          >
            {preset.label}
          </Button>
        );
      })}
    </div>
  );
});
