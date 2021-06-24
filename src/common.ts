import { isIssue, Issue, IssueResult, Next, Path, Result, ValueProcessor } from './types';

export interface WithDefault<T> {
  default?: T;
}

export interface MaybeOptions {
  incorrectTypeToUndefined?: boolean;
  strictParsing?: boolean;
}

export type UndefinedHandler<T> = () => Result<T> | undefined;
export type Definitely<T> = (next: Next<unknown, T>) => (value: unknown, path?: Path[]) => Result<T>;
export type IsAs<T> = (next: Next<T, T>) => (value: unknown, path: Path[]) => Result<T>;
export type Maybe<T> = (next: Next<unknown, T>) => (value: unknown, path?: Path[]) => Result<T | undefined>;
export type Empty = (value: unknown) => boolean;
export type Check<T> = (value: unknown) => value is T;
export type Convert<T, O = CommonConvertOptions<T>> = (value: unknown, options?: O) => T | undefined;
export type Coerce<T, O> = (options?: O) => (next: Next<T, T>) => (value: T, path: Path[]) => Result<T>;
export type Validate<T, O> = (value: T, path: Path[], options: O) => IssueResult;

export const withDefault = <T>(options?: WithDefault<T>): UndefinedHandler<T> => (): Result<T> | undefined => {
  return options?.default !== undefined ? { value: options.default } : undefined;
};

export const definitely = <T>(undefinedHandler?: UndefinedHandler<T>): Definitely<T> => (next) => (value, path = []) => {
  if (value === null || value === undefined) {
    return undefinedHandler?.() ?? { issues: [Issue.fromChild(path, value, 'not-defined')] };
  }
  return next(value, path);
};

export const nullOrUndefined: Empty = (value) => {
  return value === null || value === undefined;
};

export const maybe = <T>(empty: Empty, check: Check<T>, options?: MaybeOptions, undefinedHandler?: UndefinedHandler<T>): Maybe<T> => (next) => (value, path = []) => {
  if (empty(value)) {
    return undefinedHandler?.() ?? { value: undefined };
  }

  if (options?.incorrectTypeToUndefined) {
    if (!check(value)) {
      return { value: undefined };
    }
  }

  const result = next(value, path);
  if (isIssue(result) && result.issues.length === 1 && result.issues[0].reason === 'no-conversion') {
    if (options?.strictParsing) return result;
    return { value: undefined };
  }
  return result;
};

export const is = <T>(check: Check<T>, typeName: string): IsAs<T> => (next) => (value, path = []) => {
  if (!check(value)) {
    return { issues: [Issue.fromChild(path, value, 'incorrect-type', { expectedType: typeName })] };
  }
  return next(value, path);
};

export const as = <T, O extends CommonConvertOptions<T>>(check: Check<T>, convert: Convert<T, O>, typeName: string, undefinedHandler?: UndefinedHandler<T>, options?: O): IsAs<T> => (next) => (value, path = []) => {
  if (check(value)) return next(value, path);

  const converted = options?.converter?.(value, options.convertOptions) ?? convert(value, options);
  if (converted === undefined || converted === null) {
    return undefinedHandler?.() ?? { issues: [Issue.fromChild(path, value, 'no-conversion', { toType: typeName })] };
  }
  return next(converted, path);
};

const getResultOrValidationIssues = <T, O extends CommonValidationOptions<T>>(validate: Validate<T, O>, value: T, path: Path[], options?: O): Result<T> => {
  if (!options) return { value };
  const validationResult = validate(value, path, options);
  return validationResult.issues.length ? validationResult : { value };
};

export interface CommonValidationOptions<T> {
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

export interface CommonConvertOptions<T> {
  converter?: (value: unknown, options?: any) => T | undefined;
  convertOptions?: any;
}

export const isNullable = <T>(processor: ValueProcessor<T>): ValueProcessor<T | null> => ({
  process: (value: unknown): Result<T | null> => {
    if (value === null) return { value: null };

    return processor.process(value);
  },
});

export const asNullable = <T>(processor: ValueProcessor<T>, options?: WithDefault<Exclude<T, undefined> | null>): ValueProcessor<Exclude<T, undefined> | null> => ({
  process: (value: unknown): Result<Exclude<T, undefined> | null> => {
    if (value === null) return { value: null };

    const result = processor.process(value);
    if (!isIssue(result) && result.value === undefined) {
      const defaultValue = options?.default === undefined ? null : options.default;
      return { value: defaultValue };
    }
    return result as Result<Exclude<T, undefined>>;
  },
});

export const createIsCheck = <T, TCoerceOptions, TValidationOptions extends CommonValidationOptions<T>>(
  typeName: string,
  check: Check<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: Validate<T, TValidationOptions>,
) => (options?: TCoerceOptions & TValidationOptions): ValueProcessor<T> => {
  return {
    process: definitely<T>()(
      is(check, typeName)(
        coerce(options)(
          (value, path) => getResultOrValidationIssues(validate, value, path, options)
        )
      )
    ),
  };
};

export const createMaybeCheck = <T, TCoerceOptions, TValidationOptions extends CommonValidationOptions<T>>(
  typeName: string,
  check: Check<T>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: Validate<T, TValidationOptions>,
  empty = nullOrUndefined,
) => (options?: MaybeOptions & TCoerceOptions & TValidationOptions): ValueProcessor<T | undefined> => {
  return {
    process: maybe(empty, check, options)(
      is(check, typeName)(
        coerce(options)(
          (value, path) => getResultOrValidationIssues(validate, value, path, options)
        )
      )
    ),
  };
};

export const createAsCheck = <T, TConvertOptions extends CommonConvertOptions<T>, TCoerceOptions, TValidationOptions extends CommonValidationOptions<T>>(
  typeName: string,
  check: Check<T>,
  convert: Convert<T, TConvertOptions>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: Validate<T, TValidationOptions>,
) => (options?: WithDefault<T> & TConvertOptions & TCoerceOptions & TValidationOptions): ValueProcessor<T> => {
  return {
    process: definitely<T>(withDefault(options))(
      as(check, convert, typeName, withDefault(options), options)(
        coerce(options)(
          (value, path) => getResultOrValidationIssues(validate, value, path, options)
        )
      )
    ),
  };
};

export const createMaybeAsCheck = <T, TConvertOptions extends CommonConvertOptions<T>, TCoerceOptions, TValidationOptions extends CommonValidationOptions<T>>(
  typeName: string,
  check: Check<T>,
  convert: Convert<T, TConvertOptions>,
  coerce: Coerce<T, TCoerceOptions>,
  validate: Validate<T, TValidationOptions>,
  empty = nullOrUndefined,
) => (options?: MaybeOptions & WithDefault<T> & TConvertOptions & TCoerceOptions & TValidationOptions): ValueProcessor<T | undefined> => {
  return {
    process: maybe(empty, check, options, withDefault(options))(
      as(check, convert, typeName, withDefault(options), options)(
        coerce(options)(
          (value, path) => getResultOrValidationIssues(validate, value, path, options)
        )
      ),
    ),
  };
};

export const basicValidation = <T>(value: T, path: Path[], options: CommonValidationOptions<T>): IssueResult => {
  const result: IssueResult = { issues: [] };
  if (options.validator?.(value, options.validatorOptions) === false) {
    result.issues.push(Issue.fromChild(path, value, 'validator'));
  }
  return result;
};
