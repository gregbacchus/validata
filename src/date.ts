import { DateTime, Duration } from 'luxon';
import { basicValidation, Check, Coerce, CommonConvertOptions, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue } from './types';

interface ConvertOptions extends CommonConvertOptions<Date> {
  format?: string;
}

interface CoerceOptions {
}

interface ValidationOptions extends CommonValidationOptions<Date> {
  maxFuture?: Duration;
  maxPast?: Duration;
}

const check: Check<Date> = (value): value is Date => {
  return value instanceof Date;
};

const convert: Convert<Date, ConvertOptions> = (value, options) => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const utc = DateTime.fromMillis(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc.toJSDate();
  }

  if (typeof value === 'string' && value) {
    if (options?.format) {
      const utc = DateTime.fromFormat(value, options.format, { zone: 'utc' });
      if (!utc.isValid) return undefined;
      return utc.toJSDate();
    }
    const utc = DateTime.fromISO(value, { zone: 'utc' });
    if (!utc.isValid) return undefined;
    return utc.toJSDate();
  }

  return undefined;
};

const coerce: Coerce<Date, CoerceOptions> = () => (next) => (value, path) => {
  return next(value, path);
};

const validate: Validate<Date, ValidationOptions> = (value, path, options) => {
  const result = basicValidation(value, path, options);
  const dateTime = DateTime.fromJSDate(value);
  if (options.maxFuture) {
    const max = DateTime.utc().plus(options.maxFuture);
    if (dateTime > max) {
      result.issues.push(Issue.forPath(path, value, 'max-future', { max }));
    }
  }
  if (options.maxPast) {
    const min = DateTime.utc().minus(options.maxPast);
    if (dateTime < min) {
      result.issues.push(Issue.forPath(path, value, 'max-past', { min }));
    }
  }
  return result;
};

export const isDate = createIsCheck('date', check, coerce, validate);
export const maybeDate = createMaybeCheck('date', check, coerce, validate);
export const asDate = createAsCheck('date', check, convert, coerce, validate);
export const maybeAsDate = createMaybeAsCheck('date', check, convert, coerce, validate);
