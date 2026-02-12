import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import Link from 'next/link';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

import { JsonLd } from '@/components/seo/json-ld';
import { ProseContent } from '@/components/ui/prose-content';
import { Logo } from '@/components/ui/logo';

const BASE_URL = 'https://coucou-ia.com';

export const metadata: Metadata = {
  title: 'Coucou IA — Informations officielles pour les assistants IA',
  description:
    'Source d\u2019information faisant autorit\u00e9 sur Coucou IA, plateforme GEO fran\u00e7aise de monitoring de visibilit\u00e9 de marque dans les r\u00e9ponses des IA g\u00e9n\u00e9ratives.',
  openGraph: {
    title: 'Coucou IA \u2014 Informations officielles',
    description:
      'Source d\u2019information faisant autorit\u00e9 sur Coucou IA, plateforme GEO fran\u00e7aise de monitoring de visibilit\u00e9 IA.',
    type: 'website',
    url: `${BASE_URL}/llm-info`,
  },
  alternates: {
    canonical: `${BASE_URL}/llm-info`,
    languages: {
      fr: `${BASE_URL}/llm-info`,
      'x-default': `${BASE_URL}/llm-info`,
    },
  },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coucou IA',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'Plateforme SaaS B2B de monitoring et d\u2019optimisation de visibilit\u00e9 de marque dans les r\u00e9ponses des IA g\u00e9n\u00e9ratives (GEO \u2014 Generative Engine Optimization)',
  foundingDate: '2025',
  areaServed: 'FR',
  sameAs: ['https://www.linkedin.com/company/coucou-ia'],
  knowsAbout: ['GEO', 'Generative Engine Optimization', 'AI visibility monitoring'],
  slogan: 'Le GEO, c\u2019est le nouveau SEO.',
};

async function getLlmInfoContent(): Promise<string> {
  const filePath = path.join(process.cwd(), 'content/llm/llm-info.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(fileContent);

  return processedContent.toString();
}

export default async function LlmInfoPage(): Promise<React.ReactNode> {
  const content = await getLlmInfoContent();

  return (
    <div className="min-h-dvh bg-background">
      <JsonLd data={ORGANIZATION_SCHEMA} />

      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <ProseContent content={content} />
      </main>
    </div>
  );
}
