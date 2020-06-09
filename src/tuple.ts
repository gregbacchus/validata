import { Check, Coerce, createIsCheck, createMaybeCheck, Validate } from './common';
import { isIssue, Issue, IssueResult, Result, ValueProcessor } from './types';

interface CoerceOptions<T extends unknown[]> {
  items: { [K in keyof T]: ValueProcessor<T[K]> };
}

interface ValidationOptions<T extends unknown[]> {
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

class Generic<T extends unknown[]> {
  public check: Check<T> = (value: unknown): value is T => {
    return Array.isArray(value); // TODO check generic
  }

  public process = (check: { [K in keyof T]: ValueProcessor<T[K]> }, target: T): Result<T> => {
    const issues: Issue[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const output: T = [] as any;
    check.forEach((c, i) => {
      if (i >= target.length) {
        issues.push(Issue.fromChild(i, undefined, 'expected-item'));
        return;
      }
      const value = i < target.length ? target[i] : undefined;
      const childResult = c.process(value);
      if (isIssue(childResult)) {
        childResult.issues.forEach((issue) => {
          issues.push(issue.nest(i));
        });
        return;
      }
      if (childResult) {
        output.push(childResult.value);
      } else {
        output.push(value);
      }
    });
    if (target.length > check.length) {
      for (let i = check.length; i < target.length; i++) {
        const value = target[i];
        issues.push(Issue.fromChild(i, value, 'unexpected-item'));
      }
    }
    return issues.length ? { issues } : { value: output };
  }

  public coerce: Coerce<T, CoerceOptions<T>> = (options) => (next) => (value) => {
    if (!options) return next(value);

    let coerced = value;
    const result = this.process(options.items, coerced);
    if (isIssue(result)) {
      return result;
    }
    if (result) {
      coerced = result.value;
    }
    return next(coerced);
  }

  public validate: Validate<T, ValidationOptions<T>> = (value, options) => {
    if (!options) return undefined;

    const result: IssueResult = { issues: [] };
    if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
      result.issues.push(Issue.from(value, 'validator'));
    }
    return result.issues.length ? result : undefined;
  }
}

export type Options<T extends unknown[]> = ValidationOptions<T>;

export const isTuple = <T extends unknown[]>(items: { [K in keyof T]: ValueProcessor<T[K]> }, options?: Options<T>): ValueProcessor<T> => {
  const generic = new Generic<T>();
  return createIsCheck('tuple', generic.check, generic.coerce, generic.validate)({ ...options, items });
};

export const maybeTuple = <T extends unknown[]>(items: { [K in keyof T]: ValueProcessor<T[K]> }, options?: Options<T>): ValueProcessor<T | undefined> => {
  const generic = new Generic<T>();
  return createMaybeCheck('tuple', generic.check, generic.coerce, generic.validate)({ ...options, items });
};
