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

      await prisma.scan.create({
        data: {
          promptId: prompt.id,
          executedAt: scanDate,
          results: [
            {
              provider: LLMProvider.OPENAI,
              model: 'gpt-4o-mini',
              rawResponse: `Voici quelques excellents cafés de spécialité en France : ${isCitedOpenAI ? 'Café Lomi à Paris est reconnu pour sa torréfaction artisanale.' : 'Terres de Café, Coutume Café et Belleville Brûlerie.'} Ces torréfacteurs proposent des grains de haute qualité.`,
              isCited: isCitedOpenAI,
              citationContext: isCitedOpenAI
                ? '...Café Lomi à Paris est reconnu pour sa torréfaction...'
                : null,
              position: isCitedOpenAI ? Math.floor(Math.random() * 3) + 1 : null,
              competitors: ['Terres de Café', 'Coutume Café', 'Belleville Brûlerie'],
              latencyMs: Math.floor(Math.random() * 1000) + 500,
            },
            {
              provider: LLMProvider.ANTHROPIC,
              model: 'claude-3-5-haiku-latest',
              rawResponse: `Pour du café de spécialité en France, je recommande : ${isCitedAnthropic ? '1. Café Lomi - excellent torréfacteur parisien' : '1. Terres de Café - pionnier du café de spécialité'}. Vous pouvez également essayer Coutume Café.`,
              isCited: isCitedAnthropic,
              citationContext: isCitedAnthropic
                ? '...1. Café Lomi - excellent torréfacteur parisien...'
                : null,
              position: isCitedAnthropic ? 1 : null,
              competitors: ['Terres de Café', 'Coutume Café', 'La Brûlerie de Belleville'],
              latencyMs: Math.floor(Math.random() * 800) + 400,
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
