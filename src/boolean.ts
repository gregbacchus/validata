import { Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, IssueResult } from './types';
// // TODO replace with implementation from validata when available
// export const maybeBoolean = (): ValueProcessor<boolean | undefined> => {
//   return {
//     process: (value: unknown) => {
//       return {
//         value: value === undefined ? undefined : !!value,
//       };
//     },
//   };
// };

interface CoerceOptions {
}

interface ValidationOptions {
  validator?: (value: boolean, options?: any) => boolean;
  validatorOptions?: any;
}

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

const validate: Validate<boolean, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isBoolean = createIsCheck('boolean', check, coerce, validate);
export const maybeBoolean = createMaybeCheck('boolean', check, coerce, validate);
export const asBoolean = createAsCheck('boolean', convert, coerce, validate);
export const maybeAsBoolean = createMaybeAsCheck('boolean', check, convert, coerce, validate);
