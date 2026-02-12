'use client';

import type { Finding, PageAudit } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AuditIssuesProps {
  pages: PageAudit[];
}

interface GroupedFinding extends Finding {
  pageUrl: string;
}

const SEVERITY_ORDER = ['critical', 'warning', 'info'] as const;

const SEVERITY_CONFIG = {
  critical: { label: 'Critique', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  warning: { label: 'Attention', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  info: { label: 'Info', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
} as const;

function groupFindingsBySeverity(pages: PageAudit[]): Record<string, GroupedFinding[]> {
  const groups: Record<string, GroupedFinding[]> = {};

  for (const page of pages) {
    for (const finding of page.findings) {
      if (!groups[finding.severity]) {
        groups[finding.severity] = [];
      }
      groups[finding.severity].push({ ...finding, pageUrl: page.url });
    }
  }

  return groups;
}

export function AuditIssues({ pages }: AuditIssuesProps): React.ReactNode {
  const grouped = groupFindingsBySeverity(pages);
  const hasFindings = Object.keys(grouped).length > 0;

  if (!hasFindings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-balance">Problèmes détectés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {SEVERITY_ORDER.map((severity) => {
            const findings = grouped[severity];
            if (!findings?.length) return null;

            const config = SEVERITY_CONFIG[severity];

            return (
              <div key={severity}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn('text-xs', config.className)}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {findings.length} {findings.length > 1 ? 'problèmes' : 'problème'}
                  </span>
                </div>

                <Accordion type="multiple">
                  {findings.map((finding, index) => (
                    <AccordionItem key={`${severity}-${index}`} value={`${severity}-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col gap-0.5 pr-4">
                          <span className="text-sm font-medium">{finding.title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {finding.pageUrl}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Détail</p>
                            <p className="text-sm">{finding.detail}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Recommandation</p>
                            <p className="text-sm">{finding.recommendation}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
