import { DateTime, Duration } from 'luxon';
import { Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

interface CoerceOptions {
}

interface ValidationOptions {
  maxFuture?: Duration;
  maxPast?: Duration;
  validator?: (value: Date, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<Date> = (value): value is Date => {
  return value instanceof Date;
};

const convert: Convert<Date> = (value) => {
  if (check(value)) return value;

  if (typeof value === 'number' && !Number.isNaN(value)) {
    const utc = DateTime.fromMillis(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc.toJSDate();
  }

  if (typeof value === 'string' && value) {
    const utc = DateTime.fromISO(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc.toJSDate();
  }

  return undefined;
};

const coerce: Coerce<Date, CoerceOptions> = () => (next) => (value) => {
  return next(value);
};

const validate: Validate<Date, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  const dateTime = DateTime.fromJSDate(value);
  if (options.maxFuture) {
    const max = DateTime.utc().plus(options.maxFuture);
    if (dateTime > max) {
      result.issues.push(Issue.from(value, 'max-future', { max }));
    }
  }
  if (options.maxPast) {
    const min = DateTime.utc().minus(options.maxPast);
    if (dateTime < min) {
      result.issues.push(Issue.from(value, 'max-past', { min }));
    }
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isDate = createIsCheck('date', check, coerce, validate);
export const maybeDate = createMaybeCheck('date', check, coerce, validate);
export const asDate = createAsCheck('date', convert, coerce, validate);
export const maybeAsDate = createMaybeAsCheck('date', check, convert, coerce, validate);
