import { DateTime, Duration } from 'luxon';
import { Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

interface CoerceOptions {
}

interface ValidationOptions {
  maxFuture?: Duration;
  maxPast?: Duration;
  validator?: (value: DateTime, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<DateTime> = (value): value is DateTime => {
  return value instanceof DateTime;
};

const convert: Convert<DateTime> = (value) => {
  if (check(value)) return value;

  if (value instanceof Date) {
    const utc = DateTime.fromJSDate(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc;
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    const utc = DateTime.fromMillis(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc;
  }

  if (typeof value === 'string' && value) {
    const utc = DateTime.fromISO(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc;
  }

  return undefined;
};

const coerce: Coerce<DateTime, CoerceOptions> = () => (next) => (value) => {
  return next(value);
};

const validate: Validate<DateTime, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.maxFuture) {
    const max = DateTime.utc().plus(options.maxFuture);
    if (value > max) {
      result.issues.push(Issue.from(value, 'max-future', { max }));
    }
  }
  if (options.maxPast) {
    const min = DateTime.utc().minus(options.maxPast);
    if (value < min) {
      result.issues.push(Issue.from(value, 'max-past', { min }));
    }
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isDateTime = createIsCheck('date', check, coerce, validate);
export const maybeDateTime = createMaybeCheck('date', check, coerce, validate);
export const asDateTime = createAsCheck('date', convert, coerce, validate);
export const maybeAsDateTime = createMaybeAsCheck('date', check, convert, coerce, validate);
