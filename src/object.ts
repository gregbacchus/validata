import { Check, createIsCheck, createMaybeCheck } from './common';
import { Contract, isIssue, Issue, IssueResult, Next, Result, ValueProcessor } from './types';

interface CoerceOptions<T> {
  contract?: Contract<T>;
}

interface ValidationOptions<T> {
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

export type Coerce<T> = (next: Next<T, T>) => (value: T) => Result<T>;

class Generic<T extends object> {
  check: Check<T> = (value: unknown): value is T => {
    return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
  }

  process = (contract: Contract<T>, target: T): Result<T> => {
    const issues: Issue[] = [];

    (Object.keys(target) as Array<keyof T>).forEach((key) => {
      if (!(key in contract)) {
        issues.push(
          Issue.fromChild(key, target[key], 'unexpected-property'),
        );
      }
    });

    const output: T = {} as any;
    const keys = Object.keys(contract) as Array<keyof T>;
    keys.forEach((key) => {
      const check = contract[key];
      const value = target[key];
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

  coerce = (options?: CoerceOptions<T>): Coerce<T> => (next) => (value) => {
    if (!options) return next(value);

    let coerced = value;
    if (options.contract) {
      const result = this.process(options.contract, coerced);
      if (isIssue(result)) {
        return result;
      }
      if (result) {
        coerced = result.value;
      }
    }
    return next(coerced);
  }

  validate = (value: T, options?: ValidationOptions<T>): IssueResult | undefined => {
    if (!options) return undefined;

    const result: IssueResult = { issues: [] };
    if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
      result.issues.push(Issue.from(value, 'validator'));
    }
    return result.issues.length ? result : undefined;
  }
}

export const isObject = <T extends object>(options?: CoerceOptions<T> & ValidationOptions<T>): ValueProcessor<T> => {
  const generic = new Generic<T>();
  return createIsCheck(generic.check, generic.coerce, generic.validate)(options);
};

export const maybeObject = <T extends object>(options?: CoerceOptions<T> & ValidationOptions<T>): ValueProcessor<T | undefined> => {
  const generic = new Generic<T>();
  return createMaybeCheck(generic.check, generic.coerce, generic.validate)(options);
};
