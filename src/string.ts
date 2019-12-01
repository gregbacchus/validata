import { As, Coerce, Definitely, Is, Issue, IssueResult, Maybe, UndefinedHandler, ValueProcessor } from './types';

interface StringPadding {
  length: number;
  padWith: string;
}

interface DefinitelyOptions { }

interface MaybeOptions {
  incorrectTypeToUndefined?: boolean;
}

interface IsOptions { }

interface AsOptions {
  default?: string;
}

interface CoerceOptions {
  limitLength?: number;
  padStart?: StringPadding;
  padEnd?: StringPadding;
  trim?: 'start' | 'end' | 'both' | 'none';
}

interface ValidationOptions {
  regex?: RegExp;
  maxLength?: number;
  minLength?: number;
  validator?: (value: string, options?: any) => boolean;
  validatorOptions?: any;
}

const asUndefined: UndefinedHandler<string, AsOptions> = (options) => () => {
  if (options?.default) {
    return { value: options.default };
  }
  return undefined;
};

const definitely: Definitely<string, DefinitelyOptions> = (_options, undefinedHandler) => (next) => (value) => {
  if (value === undefined || value === null) {
    return (undefinedHandler && undefinedHandler()) ?? { issues: [Issue.from(value, 'not-defined')] };
  }
  return next(value);
};

const maybe: Maybe<string, MaybeOptions> = (options, undefinedHandler) => (next) => (value) => {
  if (value === undefined || value === null) {
    return (undefinedHandler && undefinedHandler()) ?? { value: undefined };
  }

  if (options?.incorrectTypeToUndefined) {
    if (typeof value !== 'string') {
      return { value: undefined };
    }
  }

  return next(value);
};

const is: Is<string, IsOptions> = (_options) => (next) => (value) => {
  if (typeof value !== 'string') {
    return { issues: [Issue.from(value, 'incorrect-type')] };
  }
  return next(value);
};

const as: As<string, AsOptions> = (_options) => (next) => (value) => {
  return next(String(value));
};

const coerce: Coerce<string, CoerceOptions> = (options) => (next) => (value) => {
  if (!options) return next(value);

  let coerced = value;
  if (options.limitLength !== undefined && coerced.length > options.limitLength) {
    coerced = coerced.slice(0, options.limitLength);
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
  return next(coerced);
};

function validate(value: string, options?: ValidationOptions): IssueResult | undefined {
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

type IsStringOptions = DefinitelyOptions & IsOptions & CoerceOptions & ValidationOptions;
export function IsString(options?: IsStringOptions): ValueProcessor<string> {
  return {
    process: definitely(options)(is(options)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
}

type MaybeStringOptions = MaybeOptions & IsOptions & CoerceOptions & ValidationOptions;
export function MaybeString(options?: MaybeStringOptions): ValueProcessor<string | undefined> {
  return {
    process: maybe(options)(is(options)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
}

type AsStringOptions = DefinitelyOptions & AsOptions & CoerceOptions & ValidationOptions;
export function AsString(options?: AsStringOptions): ValueProcessor<string> {
  return {
    process: definitely(options, asUndefined(options))(as(options)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
}

type MaybeAsStringOptions = MaybeOptions & AsOptions & CoerceOptions & ValidationOptions;
export function MaybeAsString(options?: MaybeAsStringOptions): ValueProcessor<string | undefined> {
  return {
    process: maybe(options, asUndefined(options))(as(options)(coerce(options)((value) => {
      const result = validate(value, options);
      return result ?? { value };
    }))),
  };
}
