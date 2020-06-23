import { Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, IssueResult } from './types';

interface CoerceOptions {
  setProtocol?: string;
}

interface ValidationOptions {
  protocol?: string;
  validator?: (value: URL, options?: any) => boolean;
  validatorOptions?: any;
}

const check: Check<URL> = (value): value is URL => {
  return value instanceof URL;
};

const convert: Convert<URL> = (value) => {
  if (check(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return new URL(value);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};

const coerce: Coerce<URL, CoerceOptions> = (options) => (next) => (value) => {
  if (!options) return next(value);

  const coerced = new URL(value.toString());
  if (options.setProtocol) {
    coerced.protocol = options.setProtocol;
  }
  return next(coerced);
};

const validate: Validate<URL, ValidationOptions> = (value, options) => {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  if (options.protocol && value.protocol.replace(/:\s*$/, '') !== options.protocol.replace(/:\s*$/, '')) {
    result.issues.push(Issue.from(value, 'invalid-protocol', { expectedProtocol: options.protocol }));
  }
  if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
    result.issues.push(Issue.from(value, 'validator'));
  }
  return result.issues.length ? result : undefined;
};

export const isUrl = createIsCheck('url', check, coerce, validate);
export const maybeUrl = createMaybeCheck('url', check, coerce, validate);
export const asUrl = createAsCheck('url', convert, coerce, validate);
export const maybeAsUrl = createMaybeAsCheck('url', check, convert, coerce, validate);
