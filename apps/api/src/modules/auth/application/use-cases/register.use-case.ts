import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ConflictError, Result } from '../../../../common';
import type { User } from '../../domain';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<Result<User, ConflictError>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      return Result.err(new ConflictError('User', 'email', dto.email));
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    return Result.ok(user);
  }
}
