import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import {
  CreatePromptUseCase,
  DeletePromptUseCase,
  ListPromptsUseCase,
  UpdatePromptUseCase,
} from '../../application/use-cases';
import { CreatePromptRequestDto, UpdatePromptRequestDto } from '../dto/prompt-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PromptController {
  constructor(
    private readonly createPromptUseCase: CreatePromptUseCase,
    private readonly listPromptsUseCase: ListPromptsUseCase,
    private readonly updatePromptUseCase: UpdatePromptUseCase,
    private readonly deletePromptUseCase: DeletePromptUseCase,
  ) {}

  @Post('projects/:projectId/prompts')
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePromptRequestDto,
  ) {
    const result = await this.createPromptUseCase.execute(projectId, user.id, user.plan, dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('projects/:projectId/prompts')
  async list(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.listPromptsUseCase.execute(projectId, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Patch('projects/:projectId/prompts/:id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePromptRequestDto,
  ) {
    const result = await this.updatePromptUseCase.execute(projectId, id, user.id, dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Delete('projects/:projectId/prompts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.deletePromptUseCase.execute(projectId, id, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }
  }
}
