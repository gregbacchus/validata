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

const requiredStrictType = () => (fn: (value: number) => Result<number>) => {
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

    return fn(value);
  };
};

const strictType = () => (fn: (value: number | undefined) => Result<number | undefined>) => {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return fn(undefined);
    }
    if (typeof value !== 'number') {
      return { issues: [Issue.from(value, 'incorrect-type')] };
    }
    if (Number.isNaN(value)) {
      return { issues: [Issue.from(value, 'not-a-number')] };
    }

    return fn(value);
  };
};

const maybe = () => (fn: (value: unknown) => Result<number | undefined>) => {
  return (value: unknown) => {
    if (value === undefined || value === null || typeof value === 'number' && Number.isNaN(value)) {
      return fn(undefined);
    }

    return fn(value);
  };
};

const coerce = (options?: AsNumberOptions) => (fn: (value: number) => Result<number>) => {
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
    return fn(coerced);
  };
};

function validate(value: number, options: NumberOptions | undefined): IssueResult | undefined {
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
}

export function IsNumber(options?: NumberOptions): ValueProcessor<number> {
  return {
    process: requiredStrictType()((value) => {
      const result = validate(value, options);
      return result || { value };
    }),
  };
}

export function MaybeNumber(options?: NumberOptions): ValueProcessor<number | undefined> {
  return {
    process: maybe()(strictType()((value) => {
      if (value === undefined) {
        return { value: undefined };
      }
      const result = validate(value, options);
      return result || { value };
    })),
  };
}

export function AsNumber(options?: AsNumberOptions): ValueProcessor<number> {
  return {
    process: coerce(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    }),
  };
}

export function MaybeAsNumber(options?: AsNumberOptions): ValueProcessor<number | undefined> {
  return {
    process: maybe()(coerce(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    })),
  };
}
