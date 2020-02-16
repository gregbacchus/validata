import { Coerce, Issue, IssueResult, Next, Result, ValueProcessor } from './types';

export interface WithDefault<T> {
  default?: T;
}

export interface MaybeOptions {
  incorrectTypeToUndefined?: boolean;
}

export type UndefinedHandler<T> = () => Result<T> | undefined;
export type Definitely<T> = (next: Next<unknown, T>) => (value: unknown) => Result<T>;
export type IsAs<T> = (next: Next<T, T>) => (value: unknown) => Result<T>;
export type Maybe<T> = (next: Next<unknown, T>) => (value: unknown) => Result<T | undefined>;
export type Check<T> = (value: unknown) => value is T;
export type Convert<T> = (value: unknown) => T;

export const withDefault = <T>(options?: WithDefault<T>): UndefinedHandler<T> => () => {
  if (options?.default) {
    return { value: options.default };
  }
  return undefined;
};

export const definitely = <T>(undefinedHandler?: UndefinedHandler<T>): Definitely<T> => (next) => (value) => {
  if (value === undefined || value === null) {
    return (undefinedHandler && undefinedHandler()) ?? { issues: [Issue.from(value, 'not-defined')] };
  }
  return next(value);
};

export const maybe = <T>(check: Check<T>, options?: MaybeOptions, undefinedHandler?: UndefinedHandler<T>): Maybe<T> => (next) => (value) => {
  if (value === undefined || value === null) {
    return (undefinedHandler && undefinedHandler()) ?? { value: undefined };
  }

  if (options?.incorrectTypeToUndefined) {
    if (!check(value)) {
      return { value: undefined };
    }
  }

  return next(value);
};

export const is = <T>(check: Check<T>): IsAs<T> => (next) => (value) => {
  if (!check(value)) {
    return { issues: [Issue.from(value, 'incorrect-type')] };
  }
  return next(value);
};

export const as = <T>(convert: Convert<T>): IsAs<T> => (next) => (value) => {
  return next(convert(value));
};

export const createIsCheck = <T, TCoerceOptions, TValidationOptions>(
  check: Check<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: (value: T, options?: TValidationOptions) => IssueResult | undefined,
) => (options?: TCoerceOptions & TValidationOptions): ValueProcessor<T> => {
  return {
    process: definitely<T>()(is(check)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
};

export const createMaybeCheck = <T, TCoerceOptions, TValidationOptions>(
  check: Check<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: (value: T, options?: TValidationOptions) => IssueResult | undefined,
) => (options?: MaybeOptions & TCoerceOptions & TValidationOptions): ValueProcessor<T | undefined> => {
  return {
    process: maybe(check, options)(is(check)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
};

export const createAsCheck = <T, TCoerceOptions, TValidationOptions>(
  convert: Convert<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: (value: T, options?: TValidationOptions) => IssueResult | undefined,
) => (options?: WithDefault<T> & TCoerceOptions & TValidationOptions): ValueProcessor<T> => {
  return {
    process: definitely<T>(withDefault(options))(as(convert)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
};

export const createMaybeAsCheck = <T, TCoerceOptions, TValidationOptions>(
  check: Check<T>,
  convert: Convert<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: (value: T, options?: TValidationOptions) => IssueResult | undefined,
) => (options?: MaybeOptions & WithDefault<T> & TCoerceOptions & TValidationOptions): ValueProcessor<T | undefined> => {
  return {
    process: maybe(check, options, withDefault(options))(as(convert)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
};
