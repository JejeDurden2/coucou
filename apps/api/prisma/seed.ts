import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Plan, LLMProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL ?? '';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@coucou-ia.fr' },
    update: {},
    create: {
      email: 'test@rankia.fr',
      name: 'Test User',
      password: hashedPassword,
      plan: Plan.SOLO,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create project
  const project = await prisma.project.upsert({
    where: { id: 'seed-project-lomi' },
    update: {},
    create: {
      id: 'seed-project-lomi',
      userId: user.id,
      name: 'Café Lomi',
      brandName: 'Café Lomi',
      brandVariants: ['Lomi', 'Lomi Coffee', 'Torréfacteur Lomi'],
      domain: 'https://lfrccafe.com',
    },
  });

  console.log(`✅ Created project: ${project.name}`);

  // Create prompts
  const promptsData = [
    {
      content: 'Quel est le meilleur café de spécialité à Paris ?',
      category: 'recommandation',
    },
    {
      content: 'Où acheter du café en grain de qualité en France ?',
      category: 'achat',
    },
    {
      content: 'Recommande-moi une marque de café artisanal',
      category: 'recommandation',
    },
    {
      content: 'Quels sont les meilleurs torréfacteurs français ?',
      category: 'comparatif',
    },
    {
      content: 'Café Lomi avis',
      category: 'avis',
    },
  ];

  for (const promptData of promptsData) {
    await prisma.prompt.upsert({
      where: {
        id: `seed-prompt-${promptData.content.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`,
      },
      update: {},
      create: {
        id: `seed-prompt-${promptData.content.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`,
        projectId: project.id,
        content: promptData.content,
        category: promptData.category,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${promptsData.length} prompts`);

  // Get all prompts for scan creation
  const prompts = await prisma.prompt.findMany({
    where: { projectId: project.id },
  });

  // Create historical scans
  const now = new Date();
  const scanDates = [
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  ];

  for (const scanDate of scanDates) {
    for (const prompt of prompts) {
      const isCitedOpenAI = Math.random() > 0.4;
      const isCitedAnthropic = Math.random() > 0.3;

      const openaiPosition = isCitedOpenAI ? Math.floor(Math.random() * 3) + 1 : null;
      const anthropicPosition = isCitedAnthropic ? 1 : null;

      await prisma.scan.create({
        data: {
          promptId: prompt.id,
          executedAt: scanDate,
          results: [
            {
              provider: LLMProvider.OPENAI,
              model: 'gpt-4o-mini',
              rawResponse: JSON.stringify({
                r: [
                  ...(isCitedOpenAI && openaiPosition === 1
                    ? [{ n: 'Café Lomi', k: ['artisanal', 'parisien', 'qualité'] }]
                    : [{ n: 'Terres de Café', k: ['pionnier', 'spécialité', 'premium'] }]),
                  ...(isCitedOpenAI && openaiPosition === 2
                    ? [{ n: 'Café Lomi', k: ['artisanal', 'parisien', 'qualité'] }]
                    : [{ n: 'Coutume Café', k: ['branché', 'tendance', 'qualité'] }]),
                  ...(isCitedOpenAI && openaiPosition === 3
                    ? [{ n: 'Café Lomi', k: ['artisanal', 'parisien', 'qualité'] }]
                    : [{ n: 'Belleville Brûlerie', k: ['local', 'hipster', 'bio'] }]),
                  { n: 'La Caféothèque', k: ['historique', 'référence', 'formation'] },
                  { n: 'Hexagone Café', k: ['moderne', 'éthique', 'traçable'] },
                ],
                q: ['café', 'spécialité'],
              }),
              isCited: isCitedOpenAI,
              position: openaiPosition,
              brandKeywords: isCitedOpenAI ? ['artisanal', 'parisien', 'qualité'] : [],
              queryKeywords: ['café', 'spécialité'],
              competitorMentions: [
                { name: 'Terres de Café', position: 1, keywords: ['pionnier', 'spécialité', 'premium'] },
                { name: 'Coutume Café', position: 2, keywords: ['branché', 'tendance', 'qualité'] },
                { name: 'Belleville Brûlerie', position: 3, keywords: ['local', 'hipster', 'bio'] },
              ].filter((c) => c.name !== 'Café Lomi'),
              latencyMs: Math.floor(Math.random() * 1000) + 500,
              parseSuccess: true,
            },
            {
              provider: LLMProvider.ANTHROPIC,
              model: 'claude-3-5-haiku-latest',
              rawResponse: JSON.stringify({
                r: [
                  ...(isCitedAnthropic
                    ? [{ n: 'Café Lomi', k: ['torréfacteur', 'artisanal', 'paris'] }]
                    : [{ n: 'Terres de Café', k: ['pionnier', 'expert', 'premium'] }]),
                  { n: 'Coutume Café', k: ['tendance', 'design', 'qualité'] },
                  { n: 'La Brûlerie de Belleville', k: ['authentique', 'local', 'bio'] },
                  { n: 'Café Kitsuné', k: ['lifestyle', 'japonais', 'branché'] },
                  { n: 'Boot Café', k: ['compact', 'expert', 'quartier'] },
                ],
                q: ['café', 'france'],
              }),
              isCited: isCitedAnthropic,
              position: anthropicPosition,
              brandKeywords: isCitedAnthropic ? ['torréfacteur', 'artisanal', 'paris'] : [],
              queryKeywords: ['café', 'france'],
              competitorMentions: [
                { name: 'Coutume Café', position: 2, keywords: ['tendance', 'design', 'qualité'] },
                { name: 'La Brûlerie de Belleville', position: 3, keywords: ['authentique', 'local', 'bio'] },
                { name: 'Café Kitsuné', position: 4, keywords: ['lifestyle', 'japonais', 'branché'] },
              ],
              latencyMs: Math.floor(Math.random() * 800) + 400,
              parseSuccess: true,
            },
          ],
        },
      });
    }
  }

  console.log(`✅ Created ${scanDates.length * prompts.length} historical scans`);

  // Update project lastScannedAt
  await prisma.project.update({
    where: { id: project.id },
    data: { lastScannedAt: scanDates[scanDates.length - 1] },
  });

  console.log('🎉 Seed completed!');
  console.log('\n📋 Test credentials:');
  console.log('   Email: test@rankia.fr');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
