/**
 * Script to manually trigger sentiment scans for a specific user's projects
 *
 * Usage:
 *   npx ts-node scripts/trigger-sentiment-scan.ts <userId>
 *   npx ts-node scripts/trigger-sentiment-scan.ts --all  # All eligible users
 *
 * In production (Railway):
 *   railway run npx ts-node scripts/trigger-sentiment-scan.ts <userId>
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SentimentQueueService } from '../src/infrastructure/queue/sentiment-queue.service';
import { PrismaService } from '../src/prisma';
import { Plan } from '@prisma/client';

async function bootstrap() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx ts-node scripts/trigger-sentiment-scan.ts <userId> | --all');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const sentimentQueue = app.get(SentimentQueueService);
  const prisma = app.get(PrismaService);

  try {
    if (args[0] === '--all') {
      // Trigger for all eligible users (SOLO/PRO)
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
    } else {
      // Trigger for specific user
      const userId = args[0];

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, plan: true },
      });

      if (!user) {
        console.error(`User not found: ${userId}`);
        process.exit(1);
      }

      if (user.plan === Plan.FREE) {
        console.warn(
          `Warning: User ${user.email} is on FREE plan. Sentiment scans require SOLO/PRO.`,
        );
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
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
