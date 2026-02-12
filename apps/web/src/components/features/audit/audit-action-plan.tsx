'use client';

import type { ActionItem } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AuditActionPlanProps {
  quickWins: ActionItem[];
  shortTerm: ActionItem[];
  mediumTerm: ActionItem[];
}

const SECTIONS = [
  { key: 'quickWins' as const, title: 'Quick wins' },
  { key: 'shortTerm' as const, title: 'Court terme' },
  { key: 'mediumTerm' as const, title: 'Moyen terme' },
] as const;

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  high: { label: 'Haute', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  medium: { label: 'Moyenne', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  low: { label: 'Basse', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
} as const;

function DotScale({ value, max = 5, label }: { value: number; max?: number; label: string }): React.ReactNode {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>
      <span className="tabular-nums text-xs tracking-wider">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn(i < value ? 'text-primary' : 'text-muted-foreground/30')}>
            ●
          </span>
        ))}
      </span>
    </div>
  );
}

function ActionCard({ action }: { action: ActionItem }): React.ReactNode {
  const priorityConfig = PRIORITY_CONFIG[action.priority];

  return (
    <AccordionItem value={action.id}>
      <AccordionTrigger className="text-left hover:no-underline">
        <div className="flex flex-col gap-1.5 pr-4 w-full">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium">{action.title}</span>
            <Badge variant="outline" className={cn('text-xs shrink-0', priorityConfig.className)}>
              {priorityConfig.label}
            </Badge>
          </div>
          {action.targetUrl && (
            <span className="text-xs text-muted-foreground truncate max-w-sm">
              {action.targetUrl}
            </span>
          )}
          <div className="flex gap-4">
            <DotScale value={action.estimatedImpact} label="Impact" />
            <DotScale value={action.estimatedEffort} label="Effort" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          <p className="text-sm">{action.description}</p>

          {action.details && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Détails</p>
              <p className="text-sm">{action.details}</p>
            </div>
          )}

          {action.contentBrief && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Brief de contenu</p>
              {action.contentBrief.suggestedTitle && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Titre suggéré :</span>{' '}
                  {action.contentBrief.suggestedTitle}
                </p>
              )}
              {action.contentBrief.targetKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {action.contentBrief.targetKeywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}
              {action.contentBrief.outline.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plan :</p>
                  <ol className="list-decimal list-inside text-sm space-y-0.5">
                    {action.contentBrief.outline.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
              {action.contentBrief.targetWordCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Objectif : {action.contentBrief.targetWordCount} mots
                </p>
              )}
            </div>
          )}

          {action.technicalSpec?.codeSnippet && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Extrait technique</p>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto font-mono">
                {action.technicalSpec.codeSnippet}
              </pre>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function AuditActionPlan({ quickWins, shortTerm, mediumTerm }: AuditActionPlanProps): React.ReactNode {
  const data = { quickWins, shortTerm, mediumTerm };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-balance">Plan d'action</h2>

      {SECTIONS.map(({ key, title }) => {
        const actions = data[key];
        if (!actions.length) return null;

        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-base text-balance">
                {title}
                <span className="text-muted-foreground font-normal ml-2 tabular-nums text-sm">
                  ({actions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {actions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
