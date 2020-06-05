import { Check, Coerce, createIsCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

interface ValidationOptions {
  validator?: (value: any, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<any> = (value): value is any => !value || !!value;

const coerce: Coerce<any, undefined> = () => (next) => (value) => next(value);

const validate: Validate<any, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isAny = createIsCheck(check, coerce, validate);
