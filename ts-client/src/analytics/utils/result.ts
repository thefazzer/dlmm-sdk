export class Result<T, E extends Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null
  ) {}

  static ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result(value, null);
  }

  static err<T, E extends Error>(error: E): Result<T, E> {
    return new Result(null, error);
  }

  isOk(): boolean {
    return this.error === null;
  }

  isErr(): boolean {
    return this.error !== null;
  }

  unwrap(): T {
    if (this.error) {
      throw this.error;
    }
    return this.value!;
  }

  unwrapErr(): E {
    if (this.value) {
      throw new Error('Cannot unwrap error from an Ok result');
    }
    return this.error!;
  }
}
