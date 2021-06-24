import { isIssue, Issue, Path, ValueProcessor } from './types';

export class ValidationError extends Error {
  constructor(public readonly issues: Issue[]) {
    super('Validation failed');

    this.name = 'ValidationError';
    // Set the prototype explicitly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const check = <T>(check: ValueProcessor<T>, value: () => unknown, path: Path | Path[] = []): T => {
  const result = check.process(value(), Array.isArray(path) ? path : [path]);
  if (isIssue(result)) {
    throw new ValidationError(result.issues);
  }
  return result.value;
};
