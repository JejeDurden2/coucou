import { Body, Controller, HttpException, Post, UseGuards } from '@nestjs/common';
import { Plan } from '@coucou-ia/shared';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import { GenerateOnboardingPromptsUseCase } from '../../application/use-cases/generate-onboarding-prompts.use-case';
import type { GeneratePromptsResponseDto } from '../dto/onboarding.dto';
import { GeneratePromptsRequestDto } from '../dto/onboarding.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private readonly generateOnboardingPromptsUseCase: GenerateOnboardingPromptsUseCase,
  ) {}

  @Post('generate-prompts')
  async generatePrompts(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GeneratePromptsRequestDto,
  ): Promise<GeneratePromptsResponseDto> {
    const result = await this.generateOnboardingPromptsUseCase.execute(
      dto.projectId,
      user.id,
      user.plan as Plan,
    );

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return { prompts: result.value };
  }
}
