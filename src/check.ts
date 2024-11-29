import { AsyncValueProcessor, isIssue, Issue, Path, Result, ValueProcessor } from './types';

export class ValidationError extends Error {
  constructor(public readonly issues: Issue[]) {
    super('Validation failed');

    this.name = 'ValidationError';
    // Set the prototype explicitly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const getValue = <T>(result: Result<T>): T => {
  if (isIssue(result)) throw new ValidationError(result.issues);

  return result.value;
};

export const check = <T>(valueProcessor: ValueProcessor<T>, value: () => unknown, path: Path | Path[] = []): T => {
  const result = valueProcessor.process(value(), Array.isArray(path) ? path : [path]);
  return getValue(result);
};

export const checkAsync = async <T>(asyncValueProcessor: AsyncValueProcessor<T>, value: () => unknown | Promise<unknown>, path: Path | Path[] = []): Promise<T> => {
  const result = await asyncValueProcessor.process(await value(), Array.isArray(path) ? path : [path]);
  return getValue(result);
};
