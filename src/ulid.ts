import { Check, Coerce, createIsCheck, createMaybeCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

// cSpell:ignore HJKMNP
export const REGEX_ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

interface ValidationOptions {
  validator?: (value: string, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<string> = (value): value is string => {
  return typeof value === 'string' && REGEX_ULID.test(value);
};

const coerce: Coerce<string, unknown> = () => (next) => (value) => next(value);

const validate: Validate<string, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isUlid = createIsCheck('ulid', check, coerce, validate);
export const maybeUlid = createMaybeCheck('ulid', check, coerce, validate);
