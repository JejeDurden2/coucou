import { Inject, Injectable, Optional } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { ForbiddenError, ValidationError } from '../../../../common/errors/domain-error';
import { Result } from '../../../../common/utils/result';
import { withSpan } from '../../../../common/tracing';
import { LoggerService } from '../../../../common/logger';
import {
  EMAIL_PORT,
  type EmailAttachment,
  type EmailPort,
  generateSupportRequestEmail,
} from '../../../email';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { SUPPORT_MAX_SCREENSHOT_SIZE, type SupportCategory } from '@coucou-ia/shared';

const SUPPORT_EMAIL = 'support@coucou-ia.com';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

interface SendSupportRequestInput {
  userId: string;
  userEmail: string;
  plan: Plan;
  category: SupportCategory;
  subject: string;
  message: string;
  screenshot?: string;
  projectId?: string;
}

function parseBase64Screenshot(raw: string): { data: string; extension: string } {
  const dataUriMatch = raw.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (dataUriMatch) {
    const mime = dataUriMatch[1].toLowerCase();
    return {
      data: dataUriMatch[2],
      extension: MIME_EXTENSIONS[mime] ?? 'png',
    };
  }
  return { data: raw, extension: 'png' };
}

@Injectable()
export class SendSupportRequestUseCase {
  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    @Optional()
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository | undefined,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SendSupportRequestUseCase.name);
  }

  async execute(
    input: SendSupportRequestInput,
  ): Promise<Result<{ success: boolean }, ForbiddenError | ValidationError>> {
    return withSpan(
      'support-module',
      'SendSupportRequestUseCase.execute',
      {
        'support.userId': input.userId,
        'support.plan': input.plan,
        'support.category': input.category,
      },
      async () => {
        const { userId, userEmail, plan, category, subject, message, screenshot, projectId } =
          input;

        if (plan === Plan.FREE) {
          return Result.err(
            new ForbiddenError('Le support par email est réservé aux plans SOLO et PRO'),
          );
        }

        let screenshotAttachment: EmailAttachment | undefined;
        if (screenshot) {
          const { data, extension } = parseBase64Screenshot(screenshot);
          const sizeInBytes = Buffer.byteLength(data, 'base64');
          if (sizeInBytes > SUPPORT_MAX_SCREENSHOT_SIZE) {
            return Result.err(
              new ValidationError(["La capture d'écran dépasse la taille maximale de 5 Mo"]),
            );
          }
          screenshotAttachment = {
            filename: `screenshot.${extension}`,
            content: Buffer.from(data, 'base64'),
          };
        }

        let projectName: string | undefined;
        if (projectId && this.projectRepository) {
          const project = await this.projectRepository.findById(projectId);
          projectName = project?.name;
        }

        const { html, text } = generateSupportRequestEmail({
          userEmail,
          userId,
          plan: plan as 'SOLO' | 'PRO',
          category,
          subject,
          message,
          projectId,
          projectName,
          timestamp: new Date().toISOString(),
        });

        await this.emailPort.send({
          to: SUPPORT_EMAIL,
          subject: `[${plan}] ${category} - ${subject}`,
          html,
          text,
          attachments: screenshotAttachment ? [screenshotAttachment] : undefined,
        });

        this.logger.info('Support request sent', {
          userId,
          plan,
          category,
          hasScreenshot: !!screenshot,
          projectId: projectId ?? null,
        });

        return Result.ok({ success: true });
      },
    );
  }
}
