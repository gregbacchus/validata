import { basicValidation, Check, Coerce, CommonValidationOptions, createIsCheck, createMaybeCheck, Validate } from './common';
import { isIssue, Issue, Result, ValueProcessor } from './types';

interface CoerceOptions<V> {
  check?: ValueProcessor<V>;
}

interface ValidationOptions<T> extends CommonValidationOptions<T> {
  keyRegex?: RegExp;
  maxKeys?: number;
  minKeys?: number;
}

class Generic<V> {
  public check: Check<Record<string, V>> = (value: unknown): value is Record<string, V> => {
    return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
  }

  public process = (check: ValueProcessor<V>, target: Record<string, V>): Result<Record<string, V>> => {
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

  public coerce: Coerce<Record<string, V>, CoerceOptions<V>> = (options) => (next) => (value) => {
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

  public validate: Validate<Record<string, V>, ValidationOptions<Record<string, V>>> = (value, options) => {
    const result = basicValidation(value, options);
    const keyCount = Object.keys(value).length;
    const keyRegex = options.keyRegex;
    if (keyRegex !== undefined) {
      result.issues.push(
        ...Object.keys(value).reduce((acc, key) => {
          if (!keyRegex.test(key)) {
            acc.push(Issue.from(key, 'key-regex', { key, regex: keyRegex.toString() }));
          }
          return acc;
        }, [] as Issue[])
      );
    }
    if (options.minKeys !== undefined && keyCount < options.minKeys) {
      result.issues.push(Issue.from(value, 'min-keys', { keyCount, min: options.minKeys }));
    }
    if (options.maxKeys !== undefined && keyCount > options.maxKeys) {
      result.issues.push(Issue.from(value, 'max-keys', { keyCount, max: options.maxKeys }));
    }
    return result;
  }
}

export type RecordOptions<T> = ValidationOptions<T>;

export const isRecord = <V>(check?: ValueProcessor<V>, options?: RecordOptions<Record<string, V>>): ValueProcessor<Record<string, V>> => {
  const generic = new Generic<V>();
  return createIsCheck('record', generic.check, generic.coerce, generic.validate)({ ...options, check });
};

export const maybeRecord = <V>(check?: ValueProcessor<V>, options?: RecordOptions<Record<string, V>>): ValueProcessor<Record<string, V> | undefined> => {
  const generic = new Generic<V>();
  return createMaybeCheck('record', generic.check, generic.coerce, generic.validate)({ ...options, check });
};
