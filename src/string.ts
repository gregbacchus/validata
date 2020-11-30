import { DateTime, Duration } from 'luxon';
import { basicValidation, Check, Coerce, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { StringFormatCheck } from './string-format';
import { Issue } from './types';

interface StringPadding {
  length: number;
  padWith: string;
}

type StringTransform = (value: string) => string;

interface CoerceOptions {
  limitLength?: number;
  padStart?: StringPadding;
  padEnd?: StringPadding;
  transform?: StringTransform | StringTransform[];
  trim?: 'start' | 'end' | 'both' | 'none';
}

interface ValidationOptions extends CommonValidationOptions<string> {
  format?: StringFormatCheck;
  regex?: RegExp;
  maxLength?: number;
  minLength?: number;
}

const check: Check<string> = (value): value is string => {
  return typeof value === 'string';
};

const convert: Convert<string> = (value) => {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toUTC().toISO() ?? undefined;
  }
  if (value instanceof DateTime) {
    return value.toUTC().toISO() ?? undefined;
  }
  if (value instanceof Duration) {
    return value.toISO() ?? undefined;
  }
  return String(value);
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
  if (options.transform) {
    if (Array.isArray(options.transform)) {
      coerced = options.transform.reduce((acc, transform) => transform(acc), coerced);
    } else {
      coerced = options.transform(coerced);
    }
  }
  if (options.padStart && coerced.length < options.padStart.length) {
    coerced = coerced.padStart(options.padStart.length, options.padStart.padWith);
  }
  if (options.padEnd && coerced.length < options.padEnd.length) {
    coerced = coerced.padEnd(options.padEnd.length, options.padEnd.padWith);
  }
  return next(coerced);
};

const validate: Validate<string, ValidationOptions> = (value, options) => {
  const result = basicValidation(value, options);
  if (options.minLength !== undefined && value.length < options.minLength) {
    result.issues.push(Issue.from(value, 'min-length', { length: value.length, min: options.minLength }));
  }
  if (options.maxLength !== undefined && value.length > options.maxLength) {
    result.issues.push(Issue.from(value, 'max-length', { length: value.length, max: options.maxLength }));
  }
  if (options.regex !== undefined && !options.regex.test(value)) {
    result.issues.push(Issue.from(value, 'regex', { regex: options.regex.toString() }));
  }
  if (options.format !== undefined) {
    const formatResult = options.format(value);
    if (formatResult !== true) {
      result.issues.push(Issue.from(value, 'incorrect-format', formatResult));
    }
  }
  return result;
};

export const isString = createIsCheck('string', check, coerce, validate);
export const maybeString = createMaybeCheck('string', check, coerce, validate);
export const asString = createAsCheck('string', check, convert, coerce, validate);
export const maybeAsString = createMaybeAsCheck('string', check, convert, coerce, validate);
