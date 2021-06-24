import { basicValidation, Check, Coerce, CommonValidationOptions, createIsCheck, Validate } from './common';

interface ValidationOptions extends CommonValidationOptions<any> { }

const check: Check<any> = (value): value is any => !value || !!value;

const coerce: Coerce<any, any> = () => (next) => (value, path) => next(value, path);

const validate: Validate<any, ValidationOptions> = (value, path, options) => basicValidation(value, path, options);

export const isAny = createIsCheck('anything', check, coerce, validate);
