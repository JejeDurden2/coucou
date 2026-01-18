import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface CitationBadgeProps {
  isCited: boolean;
  position?: number | null;
  showPosition?: boolean;
}

export function CitationBadge({ isCited, position, showPosition = true }: CitationBadgeProps) {
  if (isCited) {
    return (
      <Badge variant="success" className="gap-1">
        <Check className="h-3 w-3" aria-hidden="true" />
        <span>Cité{showPosition && position ? ` #${position}` : ''}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <X className="h-3 w-3" aria-hidden="true" />
      <span>Absent</span>
    </Badge>
  );
}
