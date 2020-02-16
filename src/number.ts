import { Issue, IssueResult, Result, ValueProcessor } from './types';

interface NumberOptions {
  max?: number;
  min?: number;
  validator?: (value: number, options?: any) => boolean;
  validatorOptions?: any;
}

interface AsNumberOptions extends NumberOptions {
  default?: number;
}

const requiredStrictType = () => (next: (value: number) => Result<number>) => {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return { issues: [Issue.from(value, 'not-defined')] };
    }
    if (typeof value !== 'number') {
      return { issues: [Issue.from(value, 'incorrect-type')] };
    }
    if (Number.isNaN(value)) {
      return { issues: [Issue.from(value, 'not-a-number')] };
    }

    return next(value);
  };
};

const strictType = () => (next: (value: number | undefined) => Result<number | undefined>) => {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return next(undefined);
    }
    if (typeof value !== 'number') {
      return { issues: [Issue.from(value, 'incorrect-type')] };
    }
    if (Number.isNaN(value)) {
      return { issues: [Issue.from(value, 'not-a-number')] };
    }

    return next(value);
  };
};

const maybe = () => (next: (value: unknown) => Result<number | undefined>) => {
  return (value: unknown) => {
    if (value === undefined || value === null || typeof value === 'number' && Number.isNaN(value)) {
      return next(undefined);
    }

    return next(value);
  };
};

const coerce = (options?: AsNumberOptions) => (next: (value: number) => Result<number>) => {
  return (value: unknown) => {
    if (Array.isArray(value)) {
      return { value: options && options.default !== undefined && options.default || Number.NaN };
    }
    if (value === null) {
      return { value: options && options.default !== undefined && options.default || Number.NaN };
    }
    let coerced = Number(value);
    if (options) {
      if (Number.isNaN(coerced) && options.default !== undefined) {
        return { value: options.default };
      }
      if (options.min !== undefined && coerced < options.min) {
        coerced = options.min;
      }
      if (options.max !== undefined && coerced > options.max) {
        coerced = options.max;
      }
    }
    return next(coerced);
  };
};

const coerceMaybe = (options?: AsNumberOptions) => (next: (value: number) => Result<number>) => {
  return (value: unknown) => {
    if (value === undefined) {
      return { value: options?.default ?? undefined };
    }
    if (Array.isArray(value)) {
      return { value: options?.default ?? undefined };
    }
    if (value === null) {
      return { value: options && options.default !== undefined && options.default || Number.NaN };
    }
    let coerced = Number(value);
    if (Number.isNaN(coerced)) {
      return { value: options?.default ?? undefined };
    }
    if (options) {
      if (options.min !== undefined && coerced < options.min) {
        coerced = options.min;
      }
      if (options.max !== undefined && coerced > options.max) {
        coerced = options.max;
      }
    }
    return next(coerced);
  };
};

const validate = (value: number, options: NumberOptions | undefined): IssueResult | undefined => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.min !== undefined && value < options.min) {
    result.issues.push(Issue.from(value, 'min'));
  }
  if (options.max !== undefined && value > options.max) {
    result.issues.push(Issue.from(value, 'max'));
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const IsNumber = (options?: NumberOptions): ValueProcessor<number> => {
  return {
    process: requiredStrictType()((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }),
  };
};

export const MaybeNumber = (options?: NumberOptions): ValueProcessor<number | undefined> => {
  return {
    process: maybe()(strictType()((value) => {
      if (value === undefined) {
        return { value: undefined };
      }
      const result = validate(value, options);
      return result ?? { value };
    })),
  };
};

export const AsNumber = (options?: AsNumberOptions): ValueProcessor<number> => {
  return {
    process: coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }),
  };
};

export const MaybeAsNumber = (options?: AsNumberOptions): ValueProcessor<number | undefined> => {
  return {
    process: maybe()(coerceMaybe(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    })),
  };
};
