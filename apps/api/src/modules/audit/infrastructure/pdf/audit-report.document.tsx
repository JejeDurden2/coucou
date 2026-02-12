import { Document } from '@react-pdf/renderer';
import type { AuditResult } from '@coucou-ia/shared';

import { CoverPage } from './components/cover-page';
import { ExecutiveSummary } from './components/executive-summary';
import { CompetitorBenchmarkSection } from './components/competitor-benchmark';
import { DetailedDiagnosis } from './components/detailed-diagnosis';
import { ActionPlanSection } from './components/action-plan';
import { CtaPage } from './components/cta-page';

interface AuditReportDocumentProps {
  auditResult: AuditResult;
  brandName: string;
  domain: string;
  completedAt: Date;
}

export function AuditReportDocument({
  auditResult,
  brandName,
  domain,
  completedAt,
}: AuditReportDocumentProps): React.JSX.Element {
  return (
    <Document
      title={`Audit GEO - ${brandName}`}
      author="Coucou IA"
      subject={`Rapport d'audit GEO pour ${domain}`}
      creator="Coucou IA"
    >
      <CoverPage
        brandName={brandName}
        domain={domain}
        completedAt={completedAt}
      />
      <ExecutiveSummary geoScore={auditResult.geoScore} />
      <CompetitorBenchmarkSection
        competitors={auditResult.competitorBenchmark}
        brandName={brandName}
        brandScore={auditResult.geoScore.overall}
      />
      <DetailedDiagnosis pages={auditResult.siteAudit.pagesAnalyzed} />
      <ActionPlanSection actionPlan={auditResult.actionPlan} />
      <CtaPage brandName={brandName} />
    </Document>
  );
}
