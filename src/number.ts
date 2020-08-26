import { Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Empty, Validate } from './common';
import { Issue, IssueResult } from './types';

interface CoerceOptions {
  coerceMin?: number;
  coerceMax?: number;
}

interface ValidationOptions {
  max?: number;
  min?: number;
  validator?: (value: number, options?: any) => boolean;
  validatorOptions?: any;
}

export const empty: Empty = (value) => {
  return value === '' || value === null || value === undefined || typeof value === 'number' && Number.isNaN(value);
};

const check: Check<number> = (value): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
};

const convert: Convert<number> = (value) => {
  if (Array.isArray(value)) return undefined;

  const converted = Number(value);
  if (!Number.isNaN(converted)) return converted;
  return undefined;
};

const coerce: Coerce<number, CoerceOptions> = (options) => (next) => (value) => {
  if (!options) return next(value);

  let coerced = value;
  if (options.coerceMin !== undefined && coerced < options.coerceMin) {
    coerced = options.coerceMin;
  }
  if (options.coerceMax !== undefined && coerced > options.coerceMax) {
    coerced = options.coerceMax;
  }
  return next(coerced);
};

const validate: Validate<number, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.min !== undefined && value < options.min) {
    result.issues.push(Issue.from(value, 'min', { min: options.min }));
  }
  if (options.max !== undefined && value > options.max) {
    result.issues.push(Issue.from(value, 'max', { max: options.max }));
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isNumber = createIsCheck('number', check, coerce, validate);
export const maybeNumber = createMaybeCheck('number', check, coerce, validate, empty);
export const asNumber = createAsCheck('number', convert, coerce, validate);
export const maybeAsNumber = createMaybeAsCheck('number', check, convert, coerce, validate, empty);
