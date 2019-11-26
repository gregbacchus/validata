import { Issue, IssueResult, Result, ValueProcessor } from './types';

interface StringPadding {
  length: number;
  padWith: string;
}

interface StringOptions {
  regex?: RegExp;
  maxLength?: number;
  minLength?: number;
  padStart?: StringPadding;
  padEnd?: StringPadding;
  trim?: 'start' | 'end' | 'both' | 'none';
  validator?: (value: string, options?: any) => boolean;
  validatorOptions?: any;
}

function validate(value: string, options: StringOptions | undefined): IssueResult | undefined {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.minLength !== undefined && value.length < options.minLength) {
    result.issues.push(Issue.from(value, 'min-length'));
  }
  if (options.maxLength !== undefined && value.length > options.maxLength) {
    result.issues.push(Issue.from(value, 'max-length'));
  }
  if (options.regex !== undefined && !options.regex.test(value)) {
    result.issues.push(Issue.from(value, 'regex'));
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
}

const maybe = () => (fn: (value: string) => Result<string | undefined>) => {
  return (value: any) => {
    if (value === undefined || value === null) {
      return { value: undefined };
    }

    return fn(value);
  };
};

const coerce = (options?: StringOptions) => (fn: (value: string) => Result<string>) => {
  return (value: any) => {
    let coerced = String(value);
    if (options) {
      if (options.maxLength !== undefined && coerced.length > options.maxLength) {
        coerced = coerced.slice(0, options.maxLength);
      }
      switch (options.trim) {
        case 'start':
          coerced = coerced.trimStart();
          break;
        case 'end':
          coerced = coerced.trimRight();
          break;
        case 'both':
          coerced = coerced.trim();
          break;
      }
      if (options.padStart && coerced.length < options.padStart.length) {
        coerced = coerced.padStart(options.padStart.length, options.padStart.padWith);
      }
      if (options.padEnd && coerced.length < options.padEnd.length) {
        coerced = coerced.padEnd(options.padEnd.length, options.padEnd.padWith);
      }
    }
    return fn(coerced);
  };
};

export function IsString(options?: StringOptions): ValueProcessor<string> {
  return {
    process: (value) => {
      if (value === undefined || value === null) {
        return { issues: [Issue.from(value, 'not-defined')] };
      }
      if (typeof value !== 'string') {
        return { issues: [Issue.from(value, 'incorrect-type')] };
      }
      const result = validate(value, options);
      return result ?? { value };
    },
  };
}

export function MaybeString(options?: StringOptions): ValueProcessor<string | undefined> {
  return {
    process: maybe()((value) => {
      if (typeof value !== 'string') {
        return { value: undefined };
      }
      const result = validate(value, options);
      return result ?? { value };
    }),
  };
}

export function AsString(options?: StringOptions): ValueProcessor<string> {
  return {
    process: coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }),
  };
}

export function MaybeAsString(options?: StringOptions): ValueProcessor<string | undefined> {
  return {
    process: maybe()(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    })),
  };
}
