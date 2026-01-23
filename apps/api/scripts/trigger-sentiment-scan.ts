/**
 * Script to manually trigger sentiment scans for a specific user's projects
 *
 * Usage:
 *   pnpm sentiment:trigger <userId>
 *   pnpm sentiment:trigger --all  # All eligible users
 *
 * In production (Railway):
 *   railway run pnpm sentiment:trigger <userId>
 */

import { Plan } from '@prisma/client';

import { bootstrapScript } from '../src/common';
import { SentimentScriptModule, SentimentScriptQueueService } from '../src/modules/sentiment';
import { PrismaService } from '../src/prisma';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: pnpm sentiment:trigger <userId> | --all');
    process.exit(1);
  }

  await bootstrapScript([SentimentScriptModule], async (app) => {
    const sentimentQueue = app.get(SentimentScriptQueueService);
    const prisma = app.get(PrismaService);

    if (args[0] === '--all') {
      await triggerForAllEligibleUsers(prisma, sentimentQueue);
    } else {
      await triggerForUser(args[0], prisma, sentimentQueue);
    }
  });
}

async function triggerForAllEligibleUsers(
  prisma: PrismaService,
  sentimentQueue: SentimentScriptQueueService,
): Promise<void> {
  const projects = await prisma.project.findMany({
    where: {
      user: {
        plan: { in: [Plan.SOLO, Plan.PRO] },
      },
    },
    select: {
      id: true,
      userId: true,
      brandName: true,
      user: { select: { email: true, plan: true } },
    },
  });

  console.log(`Found ${projects.length} eligible projects`);

  for (const project of projects) {
    const jobId = await sentimentQueue.addJob({
      projectId: project.id,
      userId: project.userId,
    });
    console.log(
      `✓ Queued sentiment scan for "${project.brandName}" (${project.user.email}) - Job ID: ${jobId}`,
    );
  }

  console.log(`\nDone! Queued ${projects.length} sentiment scans.`);
}

async function triggerForUser(
  userId: string,
  prisma: PrismaService,
  sentimentQueue: SentimentScriptQueueService,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true },
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    process.exit(1);
  }

  if (user.plan === Plan.FREE) {
    console.warn(`Warning: User ${user.email} is on FREE plan. Sentiment scans require SOLO/PRO.`);
    console.log('Proceeding anyway for testing purposes...');
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    select: { id: true, brandName: true },
  });

  if (projects.length === 0) {
    console.log(`User ${user.email} has no projects.`);
    process.exit(0);
  }

  console.log(`Found ${projects.length} projects for user ${user.email} (${user.plan})`);

  for (const project of projects) {
    const jobId = await sentimentQueue.addJob({
      projectId: project.id,
      userId: userId,
    });
    console.log(`✓ Queued sentiment scan for "${project.brandName}" - Job ID: ${jobId}`);
  }

  console.log(`\nDone! Queued ${projects.length} sentiment scans.`);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
