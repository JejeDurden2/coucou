import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditStatus } from '@coucou-ia/shared';
import { randomUUID } from 'node:crypto';

import { Result } from '../../../../common/utils/result';
import {
  NotFoundError,
  ForbiddenError,
  ExternalServiceError,
} from '../../../../common/errors/domain-error';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AuditOrder,
  AuditAlreadyActiveError,
  AuditBriefAssemblyError,
} from '../../domain';
import { BriefAssemblerService } from '../services/brief-assembler.service';
import { StripeService } from '../../../billing/infrastructure/stripe.service';

interface CreateAuditCheckoutInput {
  projectId: string;
  userId: string;
  userEmail: string;
}

interface CreateAuditCheckoutOutput {
  checkoutUrl: string;
}

type CreateAuditCheckoutError =
  | NotFoundError
  | ForbiddenError
  | AuditAlreadyActiveError
  | AuditBriefAssemblyError
  | ExternalServiceError;

@Injectable()
export class CreateAuditCheckoutUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    private readonly briefAssemblerService: BriefAssemblerService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: CreateAuditCheckoutInput,
  ): Promise<Result<CreateAuditCheckoutOutput, CreateAuditCheckoutError>> {
    const { projectId, userId, userEmail } = input;

    // 1. Verify project exists and belongs to user
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }
    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('Accès refusé à ce projet'));
    }

    // 2. Verify no active audit exists (PAID/PROCESSING block new checkout)
    const activeAudit = await this.auditOrderRepository.findActiveByProjectId(projectId);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    if (activeAudit) {
      if (activeAudit.status !== AuditStatus.PENDING) {
        return Result.err(new AuditAlreadyActiveError(projectId));
      }

      // Reuse existing PENDING order (user didn't pay, retry checkout)
      const session = await this.stripeService.createAuditCheckoutSession({
        metadata: {
          type: 'audit',
          auditOrderId: activeAudit.id,
          projectId,
          userId,
        },
        successUrl: `${frontendUrl}/projects/${projectId}/audit?success=true`,
        cancelUrl: `${frontendUrl}/projects/${projectId}/audit?canceled=true`,
        customerEmail: userEmail,
      });

      if (!session.url) {
        return Result.err(new ExternalServiceError('Stripe', 'Impossible de créer la session de paiement'));
      }

      return Result.ok({ checkoutUrl: session.url });
    }

    // 3. Generate ID and assemble brief
    const auditId = randomUUID();
    const briefResult = await this.briefAssemblerService.assemble(projectId, auditId);
    if (!briefResult.ok) {
      return Result.err(briefResult.error);
    }

    // 4. Get price amount from Stripe (single source of truth)
    const price = await this.stripeService.getAuditPrice();

    // 5. Create AuditOrder with PENDING status
    const now = new Date();
    const auditOrder = AuditOrder.create({
      id: auditId,
      userId,
      projectId,
      status: AuditStatus.PENDING,
      stripePaymentIntentId: null,
      amountCents: price.unit_amount,
      paidAt: null,
      briefPayload: briefResult.value,
      resultPayload: null,
      rawResultPayload: null,
      twinAgentId: null,
      reportUrl: null,
      startedAt: null,
      completedAt: null,
      failedAt: null,
      timeoutAt: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    });

    await this.auditOrderRepository.save(auditOrder);

    // 6. Create Stripe one-time checkout session
    const session = await this.stripeService.createAuditCheckoutSession({
      metadata: {
        type: 'audit',
        auditOrderId: auditId,
        projectId,
        userId,
      },
      successUrl: `${frontendUrl}/projects/${projectId}/audit?success=true`,
      cancelUrl: `${frontendUrl}/projects/${projectId}/audit?canceled=true`,
      customerEmail: userEmail,
    });

    if (!session.url) {
      return Result.err(new ExternalServiceError('Stripe', 'Impossible de créer la session de paiement'));
    }

    return Result.ok({ checkoutUrl: session.url });
  }
}
