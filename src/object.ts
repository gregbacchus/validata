import { basicValidation, Check, Coerce, CommonConvertOptions, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, MaybeOptions, Validate, WithDefault } from './common';
import { Contract, isIssue, Issue, Path, Result, ValueProcessor } from './types';

interface AdditionalOptions {
  stripExtraProperties?: boolean;
}

interface CoerceOptions<T> extends AdditionalOptions {
  contract?: Contract<T>;
}

interface ConvertOptions {
  reviver?: Reviver;
}

interface ValidationOptions<T> extends CommonValidationOptions<T> { }

type Reviver = (key: string, value: any) => any;

class Generic<T extends { [key: string]: any; }> {
  public check: Check<T> = (value: unknown): value is T => {
    return typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
  };

  public convert = (options?: ConvertOptions): Convert<T> => (value) => {
    if (typeof value === 'string' && value[0] === '{' && value[value.length - 1] === '}') {
      try {
        return JSON.parse(value, options?.reviver) as T;
      } catch {
        return undefined;
      }
    }

    return undefined;
  };

  public process = (contract: Contract<T>, target: T, path: Path[]): Result<T> => {
    const issues: Issue[] = [];

    (Object.keys(target) as Array<keyof T>).forEach((key) => {
      if (!(key in contract)) {
        issues.push(
          Issue.forPath([...path, key], target[key], 'unexpected-property'),
        );
      }
    });

    const output = {} as T;
    const keys = Object.keys(contract) as Array<keyof T>;
    keys.forEach((key) => {
      const check = contract[key];
      const value = target[key];
      const childResult = check.process(value, [...path, key]);
      if (isIssue(childResult)) {
        issues.push(...childResult.issues);
        return;
      }
      if (childResult.value === undefined && !(key in target)) return;

      if (childResult) {
        output[key] = childResult.value;
      } else {
        output[key] = value;
      }
    });
    return issues.length ? { issues } : { value: output };
  };

  public coerce: Coerce<T, CoerceOptions<T>> = (options) => (next) => (value, path) => {
    if (!options) return next(value, path);

    let coerced = { ...value };
    if (!options.contract) return next(coerced, path);

    if (options.stripExtraProperties) {
      const allowedProperties = new Set(Object.keys(options.contract));
      (Object.keys(coerced) as (keyof T)[]).forEach((key) => {
        if (allowedProperties.has(key as string)) return;
        delete coerced[key];
      });
    }
    const result = this.process(options.contract, coerced, path);
    if (isIssue(result)) return result;

    if (result) {
      coerced = result.value;
    }
    return next(coerced, path);
  };

  public validate: Validate<T, ValidationOptions<T>> = (value, path, options) => basicValidation(value, path, options);
}

export type ObjectOptions<T> = ValidationOptions<T> & AdditionalOptions;

export const isObject = <T extends { [key: string]: any; }>(contract?: Contract<T>, options?: ObjectOptions<T>): ValueProcessor<T> => {
  const generic = new Generic<T>();
  return createIsCheck('object', generic.check, generic.coerce, generic.validate)({ ...options, contract });
};

export const maybeObject = <T extends { [key: string]: any; }>(contract?: Contract<T>, options?: ObjectOptions<T> & MaybeOptions): ValueProcessor<T | undefined> => {
  const generic = new Generic<T>();
  return createMaybeCheck('object', generic.check, generic.coerce, generic.validate)({ ...options, contract });
};

export const asObject = <T extends { [key: string]: any; }>(
  contract?: Contract<T>,
  options?: ObjectOptions<T> & WithDefault<T> & CommonConvertOptions<T> & ConvertOptions,
): ValueProcessor<T> => {
  const generic = new Generic<T>();
  return createAsCheck('object', generic.check, generic.convert(options), generic.coerce, generic.validate)({ ...options, contract });
};

export const maybeAsObject = <T extends { [key: string]: any; }>(
  contract?: Contract<T>,
  options?: ObjectOptions<T> & WithDefault<T> & CommonConvertOptions<T> & MaybeOptions & ConvertOptions,
): ValueProcessor<T | undefined> => {
  const generic = new Generic<T>();
  return createMaybeAsCheck('object', generic.check, generic.convert(options), generic.coerce, generic.validate)({ ...options, contract });
};
