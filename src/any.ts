import { Check, Coerce, createIsCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

interface ValidationOptions {
  validator?: (value: number, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<number> = (value): value is any => true;

const coerce: Coerce<number, undefined> = () => (next) => (value) => next(value);

const validate: Validate<number, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isAny = createIsCheck(check, coerce, validate);
