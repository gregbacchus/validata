import { basicValidation, Check, Coerce, CommonValidationOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';

interface CoerceOptions {
}

interface ValidationOptions extends CommonValidationOptions<boolean> { }

const check: Check<boolean> = (value): value is boolean => {
  return typeof value === 'boolean';
};

const convert: Convert<boolean> = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'false' || value === '' || value === 0 || Number.isNaN(value)) return false;
  if (value === 'true' || (typeof value === 'number' && isFinite(value))) return true;

  return undefined;
};

const coerce: Coerce<boolean, CoerceOptions> = () => (next) => (value) => {
  return next(value);
};

const validate: Validate<boolean, ValidationOptions> = (value, options) => basicValidation(value, options);

export const isBoolean = createIsCheck('boolean', check, coerce, validate);
export const maybeBoolean = createMaybeCheck('boolean', check, coerce, validate);
export const asBoolean = createAsCheck('boolean', convert, coerce, validate);
export const maybeAsBoolean = createMaybeAsCheck('boolean', check, convert, coerce, validate);
