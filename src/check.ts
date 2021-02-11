import { isIssue, Issue, ValueProcessor } from './types';

export class ValidationError extends Error {
  constructor(public readonly issues: Issue[]) {
    super('Validation failed');

    this.name = 'ValidationError';
    // Set the prototype explicitly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const check = <T>(check: ValueProcessor<T>, value: () => unknown, nest?: string | number): T => {
  const result = check.process(value());
  if (isIssue(result)) {
    throw new ValidationError(nest ? result.issues.map((issue) => issue.nest(nest)) : result.issues);
  }
  return result.value;
};
