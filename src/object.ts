/* eslint-disable @typescript-eslint/ban-types */

import { Check, Coerce, createIsCheck, createMaybeCheck, Validate } from './common';
import { Contract, isIssue, Issue, IssueResult, Result, ValueProcessor } from './types';

interface AdditionalOptions {
  stripExtraProperties?: boolean;
}

interface CoerceOptions<T> extends AdditionalOptions {
  contract?: Contract<T>;
}

interface ValidationOptions<T> {
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

class Generic<T extends object> {
  public check: Check<T> = (value: unknown): value is T => {
    return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
  }

  public process = (contract: Contract<T>, target: T): Result<T> => {
    const issues: Issue[] = [];

    (Object.keys(target) as Array<keyof T>).forEach((key) => {
      if (!(key in contract)) {
        issues.push(
          Issue.fromChild(key, target[key], 'unexpected-property'),
        );
      }
    });

    const output = {} as T;
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

  public coerce: Coerce<T, CoerceOptions<T>> = (options) => (next) => (value) => {
    if (!options) return next(value);

    let coerced = { ...value };
    if (options.contract) {
      if (options.stripExtraProperties) {
        const allowedProperties = new Set(Object.keys(options.contract));
        (Object.keys(coerced) as (keyof T)[]).forEach((key) => {
          if (allowedProperties.has(key as string)) return;
          delete coerced[key];
        });
      }
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

  public validate: Validate<T, ValidationOptions<T>> = (value, options) => {
    if (!options) return undefined;

    const result: IssueResult = { issues: [] };
    if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
      result.issues.push(Issue.from(value, 'validator'));
    }
    return result.issues.length ? result : undefined;
  }
}

export type ObjectOptions<T> = ValidationOptions<T> & AdditionalOptions;

export const isObject = <T extends object>(contract?: Contract<T>, options?: ObjectOptions<T>): ValueProcessor<T> => {
  const generic = new Generic<T>();
  return createIsCheck(generic.check, generic.coerce, generic.validate)({ ...options, contract });
};

export const maybeObject = <T extends object>(contract?: Contract<T>, options?: ObjectOptions<T>): ValueProcessor<T | undefined> => {
  const generic = new Generic<T>();
  return createMaybeCheck(generic.check, generic.coerce, generic.validate)({ ...options, contract });
};
