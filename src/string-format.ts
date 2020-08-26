export type StringFormatCheck = (value: string) => true | FormatIssue;

export interface FormatIssue {
  expectedFormat: string;
  [ket: string]: unknown;
}

// cSpell:ignore HJKMNP
export const REGEX_ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;
export const REGEX_UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const regexCheck = (regex: RegExp, expectedFormat: string): StringFormatCheck =>
  (value) => regex.test(value) || { expectedFormat };

export namespace StringFormat {
  export const ULID = (): StringFormatCheck => regexCheck(REGEX_ULID, 'ulid');
  export const UUID = (): StringFormatCheck => regexCheck(REGEX_UUID, 'uuid');
}
