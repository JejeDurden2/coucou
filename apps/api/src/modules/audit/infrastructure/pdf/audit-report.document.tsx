import { Document } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

// Import theme to trigger font registration
import './theme';

import { ActionPlanSection } from './components/action-plan';
import { CompetitorBenchmarkSection } from './components/competitor-benchmark';
import { CoverPage } from './components/cover-page';
import { CtaPage } from './components/cta-page';
import { ExecutiveSummary } from './components/executive-summary';
import { ExternalPresence } from './components/external-presence';
import { GeoScoreDetail } from './components/geo-score-detail';
import { SiteAudit } from './components/site-audit';

interface AuditReportProps {
  analysis: AuditAnalysis;
  brand: { name: string; domain: string };
}

function AuditReportDocument({
  analysis,
  brand,
}: AuditReportProps): React.JSX.Element {
  return (
    <Document title="Audit GEO" author="Coucou IA" creator="Coucou IA">
      <CoverPage
        brandName={brand.name}
        brandDomain={brand.domain}
        geoScore={analysis.geoScore.overall}
        date={new Date()}
      />
      <ExecutiveSummary
        summary={analysis.executiveSummary}
        geoScore={analysis.geoScore}
      />
      <GeoScoreDetail geoScore={analysis.geoScore} />
      <SiteAudit siteAudit={analysis.siteAudit} />
      <ExternalPresence externalPresence={analysis.externalPresence} />
      <CompetitorBenchmarkSection
        benchmark={analysis.competitorBenchmark}
        clientGeoScore={analysis.geoScore}
        clientName={brand.name}
      />
      <ActionPlanSection actionPlan={analysis.actionPlan} />
      <CtaPage totalActions={analysis.actionPlan.totalActions} />
    </Document>
  );
}

export async function renderAuditPdf(
  analysis: AuditAnalysis,
  brand: { name: string; domain: string },
): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(
    <AuditReportDocument analysis={analysis} brand={brand} />,
  );
  return Buffer.from(pdfBuffer);
}
