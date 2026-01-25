/**
 * Met à jour la liste des domaines email jetables
 *
 * Usage:
 *   pnpm update:disposable-domains
 *
 * Source: https://github.com/disposable/disposable-email-domains
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

const SOURCE_URL =
  'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt';
const OUTPUT_PATH = join(
  __dirname,
  '../src/modules/auth/infrastructure/data/disposable-domains.json',
);

async function main(): Promise<void> {
  console.log('📥 Fetching disposable domains from GitHub...');

  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const domains = text
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);

  await writeFile(OUTPUT_PATH, JSON.stringify(domains, null, 2));

  console.log(`✅ Updated ${domains.length} domains → disposable-domains.json`);
}

main().catch((err) => {
  console.error('❌ Failed to update disposable domains:', err);
  process.exit(1);
});
