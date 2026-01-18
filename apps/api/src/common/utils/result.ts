import type { DomainError } from '../errors/domain-error';

export type Result<T, E extends DomainError = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),

  err: <E extends DomainError>(error: E): Result<never, E> => ({
    ok: false,
    error,
  }),

  isOk: <T, E extends DomainError>(result: Result<T, E>): result is { ok: true; value: T } =>
    result.ok,

  isErr: <T, E extends DomainError>(result: Result<T, E>): result is { ok: false; error: E } =>
    !result.ok,

  map: <T, U, E extends DomainError>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.ok ? Result.ok(fn(result.value)) : result,

  flatMap: <T, U, E extends DomainError>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> => (result.ok ? fn(result.value) : result),

  unwrap: <T, E extends DomainError>(result: Result<T, E>): T => {
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  },

  unwrapOr: <T, E extends DomainError>(result: Result<T, E>, defaultValue: T): T =>
    result.ok ? result.value : defaultValue,
};
