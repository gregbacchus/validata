import { basicValidation, Check, Coerce, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, ValueProcessor } from './types';

type EnumValue = string | number;
type EnumType = { [key: string]: EnumValue };

interface ValidationOptions { }

class Generic<T> {
  private keyToValue: { [key: string]: T } = {};
  private valueToKey: { [key: string]: string } = {};

  constructor(type: EnumType) {
    for (const key in type) {
      if (key) {
        if (!this.isNumber(key)) {
          this.keyToValue[key] = type[key] as unknown as T;
          this.valueToKey[type[key]] = key;
        }
      }
    }
  }

  public check: (expectInEnum?: boolean) => Check<T> = (expectInEnum = false) => {
    return (value): value is T => {
      return expectInEnum
        ? (value as EnumValue) in this.valueToKey
        : (typeof value === 'string' || typeof value === 'number');
    };
  };

  public coerce: Coerce<any, any> = () => (next) => (value, path) => {
    return next(value, path);
  };

  public convert: Convert<T> = (value) => {
    if ((value as EnumValue) in this.keyToValue) {
      return this.keyToValue[value as EnumValue];
    }
    return undefined;
  };

  public validate: Validate<T, ValidationOptions> = (value, path, options) => {
    const result = basicValidation(value, path, options);
    if (!(value in this.valueToKey)) {
      result.issues.push(Issue.forPath(path, value, 'key-not-found', {
        validKeys: Object.values(this.keyToValue),
        validValues: Object.keys(this.keyToValue),
      }));
    }
    return result;
  };

  private isNumber = (key: string): boolean => {
    return /^\d+$/gi.test(key);
  }
}

export const isEnum = <T>(type: EnumType): ValueProcessor<T> => {
  const g = new Generic<T>(type);
  return createIsCheck('enum', g.check(), g.coerce, g.validate)({});
};

export const maybeEnum = <T>(type: EnumType): ValueProcessor<T | undefined> => {
  const g = new Generic<T>(type);
  return createMaybeCheck('enum', g.check(), g.coerce, g.validate)({});
};

export const asEnum = <T>(type: EnumType): ValueProcessor<T> => {
  const g = new Generic<T>(type);
  return createAsCheck('enum', g.check(true), g.convert, g.coerce, g.validate)({});
};

export const maybeAsEnum = <T>(type: EnumType): ValueProcessor<T | undefined> => {
  const g = new Generic<T>(type);
  return createMaybeAsCheck('enum', g.check(true), g.convert, g.coerce, g.validate)({ strictParsing: true });
};
