import { isIssue, ValueProcessor } from './types';
import { ValidationError } from './validation-error';

export const base = <T>(check: ValueProcessor<T>, value: () => unknown, nest?: string | number): T => {
  const result = check.process(value());
  if (isIssue(result)) {
    throw new ValidationError(nest ? result.issues.map((issue) => issue.nest(nest)) : result.issues);
  }
  return result.value;
};
