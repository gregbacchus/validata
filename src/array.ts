import { basicValidation, Check, Coerce, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { isIssue, Issue, Result, ValueProcessor } from './types';

interface ItemProcessor {
  coerceMaxLength?: number;
}

interface CoerceOptions<I> extends ItemProcessor {
  item?: ValueProcessor<I>;
}

interface ValidationOptions<I, T extends I[]> extends CommonValidationOptions<T> {
  maxLength?: number;
  minLength?: number;
}

class Generic<I, T extends I[]> {
  public check: Check<T> = (value: unknown): value is T => {
    return Array.isArray(value); // TODO check generic
  }

  public convert: Convert<T> = (value): T | undefined => {
    if (this.check(value)) return value;
    if (value === null && value === undefined) return undefined;
    return [value] as T;
  };

  public process = (check: ValueProcessor<I>, target: T): Result<T> => {
    const issues: Issue[] = [];
    const output = [] as I[];
    target.forEach((value, i) => {
      const childResult = check.process(value);
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
    return issues.length ? { issues } : { value: output as T };
  }

  public coerce: Coerce<T, CoerceOptions<I>> = (options) => (next) => (value) => {
    if (!options) return next(value);

    let coerced = value;
    if (options.coerceMaxLength !== undefined && coerced.length > options.coerceMaxLength) {
      coerced = coerced.slice(0, options.coerceMaxLength) as T;
    }
    if (options.item) {
      const result = this.process(options.item, coerced);
      if (isIssue(result)) {
        return result;
      }
      if (result) {
        coerced = result.value;
      }
    }
    return next(coerced);
  }

  public validate: Validate<T, ValidationOptions<I, T>> = (value, options) => {
    const result = basicValidation(value, options);
    if (options.minLength !== undefined && value.length < options.minLength) {
      result.issues.push(Issue.from(value, 'min-length', { length: value.length, min: options.minLength }));
    }
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      result.issues.push(Issue.from(value, 'max-length', { length: value.length, max: options.maxLength }));
    }
    return result;
  }
}

export type ArrayOptions<I, T extends I[]> = ItemProcessor & ValidationOptions<I, T>;

export const isArray = <I, T extends I[]>(item?: ValueProcessor<I>, options?: ArrayOptions<I, T>): ValueProcessor<T> => {
  const generic = new Generic<I, T>();
  return createIsCheck('array', generic.check, generic.coerce, generic.validate)({ ...options, item });
};

export const maybeArray = <I, T extends I[]>(item?: ValueProcessor<I>, options?: ArrayOptions<I, T>): ValueProcessor<T | undefined> => {
  const generic = new Generic<I, T>();
  return createMaybeCheck('array', generic.check, generic.coerce, generic.validate)({ ...options, item });
};

export const asArray = <I, T extends I[]>(item?: ValueProcessor<I>, options?: ArrayOptions<I, T>): ValueProcessor<T> => {
  const generic = new Generic<I, T>();
  return createAsCheck('array', generic.convert, generic.coerce, generic.validate)({ ...options, item });
};

export const maybeAsArray = <I, T extends I[]>(item?: ValueProcessor<I>, options?: ArrayOptions<I, T>): ValueProcessor<T | undefined> => {
  const generic = new Generic<I, T>();
  return createMaybeAsCheck('array', generic.check, generic.convert, generic.coerce, generic.validate)({ ...options, item });
};
