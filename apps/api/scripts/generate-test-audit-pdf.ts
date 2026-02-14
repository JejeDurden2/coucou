/**
 * Generate a test audit PDF from sample data.
 *
 * Usage:
 *   cd apps/api && pnpm pdf:test
 *
 * Output:
 *   apps/api/test-audit-report.pdf
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import { renderAuditPdf } from '../src/modules/audit/infrastructure/pdf/audit-report.document';
import { testAuditAnalysis } from '../src/modules/audit/infrastructure/pdf/audit-test-data';

async function main(): Promise<void> {
  const brand = {
    name: 'Menuiserie Dubois',
    domain: 'menuiserie-dubois.fr',
  };

  console.log('Generating test audit PDF...');
  const start = Date.now();
  const buffer = await renderAuditPdf(testAuditAnalysis, brand);
  const elapsed = Date.now() - start;

  const outputPath = join(__dirname, '..', 'test-audit-report.pdf');
  writeFileSync(outputPath, buffer);

  const sizeKb = (buffer.length / 1024).toFixed(0);
  console.log(`PDF generated in ${elapsed}ms`);
  console.log(`Size: ${sizeKb} KB`);
  console.log(`Output: ${outputPath}`);
}

main().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
