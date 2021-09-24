import validator from 'validator';

export type StringFormatCheck = (value: string) => true | FormatIssue;

export interface FormatIssue {
  expectedFormat: string;
  [key: string]: unknown;
}

// cSpell:ignore HJKMNP
export const REGEX_ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;
export const REGEX_UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const regexCheck = (regex: RegExp, expectedFormat: string): StringFormatCheck =>
  (value) => regex.test(value) || { expectedFormat };

interface PasswordRequirements {
  minLength?: number;
  numberChars?: number;
  lowerCaseChars?: number;
  upperCaseChars?: number;
  specialChars?: number;
}

const DEFAULT_PASSWORD_REQUIREMENTS = {
  minLength: 8,
  numberChars: 1,
  lowerCaseChars: 1,
  upperCaseChars: 1,
  specialChars: 1,
};

const checkEmail = (): StringFormatCheck => (value) => {
  if (!validator.isEmail(value)) {
    return {
      expectedFormat: 'email',
    };
  }
  return true;
};

const checkPassword = (requirements?: PasswordRequirements): StringFormatCheck => (value) => {
  const reqWithDefaults = { ...DEFAULT_PASSWORD_REQUIREMENTS, ...requirements };

  const passwordCheck = {
    length: value.length,
    numberChars: value.match(/\d/g)?.length ?? 0,
    lowerCaseChars: value.match(/[a-z]/g)?.length ?? 0,
    upperCaseChars: value.match(/[A-Z]/g)?.length ?? 0,
    specialChars: value.match(/[^a-zA-Z0-9]/g)?.length ?? 0,
  };
  if (passwordCheck.length < reqWithDefaults.minLength
    || passwordCheck.numberChars < reqWithDefaults.numberChars
    || passwordCheck.lowerCaseChars < reqWithDefaults.lowerCaseChars
    || passwordCheck.upperCaseChars < reqWithDefaults.upperCaseChars
    || passwordCheck.specialChars < reqWithDefaults.specialChars
  ) {
    return {
      expectedFormat: 'password',
      ...reqWithDefaults,
    };
  }
  return true;
};

export namespace StringFormat {
  export const email = checkEmail;
  export const password = checkPassword;
  export const ULID = (): StringFormatCheck => regexCheck(REGEX_ULID, 'ulid');
  export const UUID = (): StringFormatCheck => regexCheck(REGEX_UUID, 'uuid');
}
