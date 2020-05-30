import { Check, Coerce, createIsCheck, createMaybeCheck, Validate } from './common';
import { isIssue, Issue, IssueResult, Result, ValueProcessor } from './types';

interface CoerceOptions<V> {
  check: ValueProcessor<V>;
}

interface ValidationOptions<T> {
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

class Generic<V> {
  check: Check<Record<string, V>> = (value: unknown): value is Record<string, V> => {
    return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
  }

  process = (check: ValueProcessor<V>, target: Record<string, V>): Result<Record<string, V>> => {
    const issues: Issue[] = [];

    const output = {} as Record<string, V>;
    const keys = Object.keys(target);
    keys.forEach((key) => {
      const value: V = target[key];
      const childResult = check.process(value);
      if (isIssue(childResult)) {
        childResult.issues.forEach((issue) => {
          issues.push(issue.nest(key));
        });
        return;
      }
      if (childResult) {
        output[key] = childResult.value;
      } else {
        output[key] = value;
      }
    });
    return issues.length ? { issues } : { value: output };
  }

  coerce: Coerce<Record<string, V>, CoerceOptions<V>> = (options) => (next) => (value) => {
    if (!options) return next(value);

    let coerced = value;
    if (options.check) {
      const result = this.process(options.check, coerced);
      if (isIssue(result)) {
        return result;
      }
      if (result) {
        coerced = result.value;
      }
    }
    return next(coerced);
  }

  validate: Validate<Record<string, V>, ValidationOptions<Record<string, V>>> = (value, options) => {
    if (!options) return undefined;

    const result: IssueResult = { issues: [] };
    if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
      result.issues.push(Issue.from(value, 'validator'));
    }
    return result.issues.length ? result : undefined;
  }
}

export type RecordOptions<T> = ValidationOptions<T>;

export const isRecord = <V>(check: ValueProcessor<V>, options?: RecordOptions<Record<string, V>>): ValueProcessor<Record<string, V>> => {
  const generic = new Generic<V>();
  return createIsCheck(generic.check, generic.coerce, generic.validate)({ ...options, check });
};

export const maybeRecord = <V>(check: ValueProcessor<V>, options?: RecordOptions<Record<string, V>>): ValueProcessor<Record<string, V> | undefined> => {
  const generic = new Generic<V>();
  return createMaybeCheck(generic.check, generic.coerce, generic.validate)({ ...options, check });
};
