import { basicValidation, Check, Coerce, CommonConvertOptions, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, MaybeOptions, Validate, WithDefault } from './common';
import { isIssue, Issue, Path, Result, ValueProcessor } from './types';

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

  public convert: Convert<Record<string, V>> = (value): Record<string, V> | undefined => {
    return this.check(value) ? value : undefined;
  };

  public process = (check: ValueProcessor<V>, target: Record<string, V>, path: Path[]): Result<Record<string, V>> => {
    const issues: Issue[] = [];

    const output = {} as Record<string, V>;
    const keys = Object.keys(target);
    keys.forEach((key) => {
      const value: V = target[key];
      const childResult = check.process(value, [...path, key]);
      if (isIssue(childResult)) {
        issues.push(...childResult.issues);
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

  public coerce: Coerce<Record<string, V>, CoerceOptions<V>> = (options) => (next) => (value, path) => {
    if (!options) return next(value, path);

    let coerced = value;
    if (options.check) {
      const result = this.process(options.check, coerced, path);
      if (isIssue(result)) {
        return result;
      }
      if (result) {
        coerced = result.value;
      }
    }
    return next(coerced, path);
  }

  public validate: Validate<Record<string, V>, ValidationOptions<Record<string, V>>> = (value, path, options) => {
    const result = basicValidation(value, path, options);
    const keyCount = Object.keys(value).length;
    const keyRegex = options.keyRegex;
    if (keyRegex !== undefined) {
      result.issues.push(
        ...Object.keys(value).reduce((acc, key) => {
          if (!keyRegex.test(key)) {
            acc.push(Issue.forPath(path, value, 'key-regex', { key, regex: keyRegex.toString() }));
          }
          return acc;
        }, [] as Issue[])
      );
    }
    if (options.minKeys !== undefined && keyCount < options.minKeys) {
      result.issues.push(Issue.forPath(path, value, 'min-keys', { keyCount, min: options.minKeys }));
    }
    if (options.maxKeys !== undefined && keyCount > options.maxKeys) {
      result.issues.push(Issue.forPath(path, value, 'max-keys', { keyCount, max: options.maxKeys }));
    }
    return result;
  }
}

export type RecordOptions<T> = ValidationOptions<T>;

export const isRecord = <V>(check?: ValueProcessor<V>, options?: RecordOptions<Record<string, V>>): ValueProcessor<Record<string, V>> => {
  const generic = new Generic<V>();
  return createIsCheck('record', generic.check, generic.coerce, generic.validate)({ ...options, check });
};

export const maybeRecord = <V>(
  check?: ValueProcessor<V>,
  options?: RecordOptions<Record<string, V>> & MaybeOptions
): ValueProcessor<Record<string, V> | undefined> => {
  const generic = new Generic<V>();
  return createMaybeCheck('record', generic.check, generic.coerce, generic.validate)({ ...options, check });
};

export const asRecord = <V>(
  check?: ValueProcessor<V>,
  options?: RecordOptions<Record<string, V>> & WithDefault<Record<string, V>> & CommonConvertOptions<Record<string, V>>
): ValueProcessor<Record<string, V>> => {
  const generic = new Generic<V>();
  return createAsCheck('record', generic.check, generic.convert, generic.coerce, generic.validate)({ ...options, check });
};

export const maybeAsRecord = <V>(
  check?: ValueProcessor<V>,
  options?: RecordOptions<Record<string, V>> & MaybeOptions & WithDefault<Record<string, V>> & CommonConvertOptions<Record<string, V>>
): ValueProcessor<Record<string, V> | undefined> => {
  const generic = new Generic<V>();
  return createMaybeAsCheck('record', generic.check, generic.convert, generic.coerce, generic.validate)({ ...options, check });
};
