'use client';

import type { PromptStat } from '@coucou-ia/shared';
import { Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CitationBadge } from './citation-badge';
import { getModelDisplayName } from './llm-result-row';
import { cn } from '@/lib/utils';

interface PromptTableProps {
  prompts: PromptStat[];
  onTriggerScan?: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  isLoading?: boolean;
}

export function PromptTable({ prompts, onTriggerScan, onDelete, isLoading }: PromptTableProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-pretty">Aucune requête configurée</p>
        <p className="text-sm text-muted-foreground mt-1 text-pretty">
          Ajoutez des requêtes pour commencer à suivre votre visibilité
        </p>
      </div>
    );
  }

  // Get unique models from all prompts for dynamic columns
  const availableModels = Array.from(
    new Set(prompts.flatMap((p) => p.modelResults.map((r) => r.model))),
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-card/80">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Prompt
            </th>
            {availableModels.map((model) => (
              <th
                key={model}
                className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-24"
              >
                {getModelDisplayName(model)}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {prompts.map((prompt) => {
            // Build a Map for O(1) lookups instead of find() in loop
            const resultsByModel = new Map(prompt.modelResults.map((r) => [r.model, r]));
            return (
              <tr
                key={prompt.promptId}
                className={cn(
                  'bg-background/30 hover:bg-muted/50 transition-colors',
                  isLoading && 'opacity-50',
                )}
              >
                <td className="px-4 py-4">
                  <p className="text-sm font-medium line-clamp-2 text-pretty">{prompt.content}</p>
                  {prompt.category && (
                    <span className="text-xs text-muted-foreground">{prompt.category}</span>
                  )}
                </td>
                {availableModels.map((model) => {
                  const result = resultsByModel.get(model);
                  return (
                    <td key={model} className="px-4 py-4 text-center">
                      {result ? (
                        <CitationBadge isCited={result.isCited} position={result.position} />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onTriggerScan && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTriggerScan(prompt.promptId)}
                        disabled={isLoading}
                        aria-label="Lancer une analyse"
                      >
                        <Play className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(prompt.promptId)}
                        disabled={isLoading}
                        aria-label="Supprimer le prompt"
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
