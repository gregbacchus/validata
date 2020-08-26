import { basicValidation, Check, Coerce, CommonValidationOptions, createIsCheck, Validate } from './common';

interface ValidationOptions extends CommonValidationOptions<any> { }

const check: Check<any> = (value): value is any => !value || !!value;

const coerce: Coerce<any, undefined> = () => (next) => (value) => next(value);

const validate: Validate<any, ValidationOptions> = (value, options) => basicValidation(value, options);

export const isAny = createIsCheck('anything', check, coerce, validate);
