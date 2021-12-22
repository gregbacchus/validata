import { basicValidation, Check, Coerce, CommonConvertOptions, Convert, createAsCheck, createIsCheck, createMaybeAsCheck, createMaybeCheck, Validate } from './common';
import { Issue, ValueProcessor } from './types';

type EnumValue = string | number;
type EnumType = { [key: string]: EnumValue };

interface EnumInfo {
  valueToKey: EnumType;
  keyToValue: EnumType;
}

interface ValidationOptions { }

const createEnumInfo = (type: EnumType): { valueToKey: EnumType, keyToValue: EnumType } => {
  const info: EnumInfo = { valueToKey: {}, keyToValue: {} };
  for (const key in type) {
    if (key) {
      if (!/^\d+$/gi.test(key)) {
        info.keyToValue[key] = type[key];
        info.valueToKey[type[key]] = key;
      }
    }
  }
  return info;
};

const check: (info: EnumInfo, expectInEnum?: boolean) => Check<EnumValue> = (info, expectInEnum = false) => {
  return (value): value is EnumValue => {
    return expectInEnum
      ? (value as EnumValue) in info.valueToKey
      : (typeof value === 'string' || typeof value === 'number');
  };
};

const coerce: Coerce<EnumValue, any> = () => (next) => (value, path) => {
  return next(value, path);
};

const convert: (info: EnumInfo) => Convert<EnumValue, CommonConvertOptions<EnumValue>> = (info) => {
  return (value) => {
    if ((value as EnumValue) in info.keyToValue) {
      return info.keyToValue[value as EnumValue];
    }
    return undefined;
  };
};

const validate: (info: EnumInfo) => Validate<EnumValue, ValidationOptions> = (info) => {
  return (value, path, options) => {
    const result = basicValidation(value, path, options);
    if (!(value in info.valueToKey)) {
      result.issues.push(Issue.forPath(path, value, 'key-not-found', {
        validKeys: Object.values(info.keyToValue),
        validValues: Object.keys(info.keyToValue),
      }));
    }
    return result;
  };
};

export const isEnum = (type: EnumType): ValueProcessor<EnumValue> => {
  const info = createEnumInfo(type);
  return createIsCheck('enum', check(info), coerce, validate(info))({});
};

export const maybeEnum = (type: EnumType): ValueProcessor<EnumValue | undefined> => {
  const info = createEnumInfo(type);
  return createMaybeCheck('enum', check(info), coerce, validate(info))({});
};

export const asEnum = (type: EnumType): ValueProcessor<EnumValue> => {
  const info = createEnumInfo(type);
  return createAsCheck('enum', check(info, true), convert(info), coerce, validate(info))({});
};

export const maybeAsEnum = (type: EnumType): ValueProcessor<EnumValue | undefined> => {
  const info = createEnumInfo(type);
  return createMaybeAsCheck('enum', check(info, true), convert(info), coerce, validate(info))({strictParsing: true});
};
