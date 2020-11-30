import { basicValidation, Check, Coerce, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Empty, Validate } from './common';
import { Issue } from './types';

interface CoerceOptions {
  coerceMin?: number;
  coerceMax?: number;
}

interface ValidationOptions extends CommonValidationOptions<number> {
  max?: number;
  min?: number;
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
  const result = basicValidation(value, options);
  if (options.min !== undefined && value < options.min) {
    result.issues.push(Issue.from(value, 'min', { min: options.min }));
  }
  if (options.max !== undefined && value > options.max) {
    result.issues.push(Issue.from(value, 'max', { max: options.max }));
  }
  return result;
};

export const isNumber = createIsCheck('number', check, coerce, validate);
export const maybeNumber = createMaybeCheck('number', check, coerce, validate, empty);
export const asNumber = createAsCheck('number', check, convert, coerce, validate);
export const maybeAsNumber = createMaybeAsCheck('number', check, convert, coerce, validate, empty);
