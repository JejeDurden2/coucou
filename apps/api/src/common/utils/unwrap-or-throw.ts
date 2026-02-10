import { HttpException } from '@nestjs/common';

import type { DomainError } from '../errors/domain-error';
import type { Result } from './result';

/**
 * Unwraps a Result in controller context: returns value on success, throws HttpException on error.
 * Eliminates repetitive `if (!result.ok) throw new HttpException(...)` blocks.
 */
export function unwrapOrThrow<T, E extends DomainError>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw new HttpException(result.error.toJSON(), result.error.statusCode);
}
