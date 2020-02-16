import validator from 'validator';
import { AsString, IsString, MaybeAsString, MaybeString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';

describe('IsString', () => {
  it('will handle non-string', () => {
    const fut = IsString();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle strings', () => {
    const fut = IsString();
    expectValue(fut, '', '');
    expectValue(fut, 'asd', 'asd');
    expectValue(fut, '123', '123');
  });

  it('will validate string length', () => {
    const fut = IsString({ minLength: 2, maxLength: 5 });
    expectValue(fut, 'asdf', 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will check regex', () => {
    const fut = IsString({ regex: /^[0-9]{3}$/ });
    expectValue(fut, '123', '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = IsString({ validator: (value) => value === 'test' });
    expectValue(fut, 'test', 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = IsString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = IsString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });
});

describe('MaybeString', () => {
  it('will handle non-string', () => {
    const fut = MaybeString();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle non-string', () => {
    const fut = MaybeString({ incorrectTypeToUndefined: true });
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('will handle strings', () => {
    const fut = MaybeString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = MaybeString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will check regex', () => {
    const fut = MaybeString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = MaybeString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = MaybeString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = MaybeString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });
});

describe('AsString', () => {
  it('will handle non-string', () => {
    const fut = AsString();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectValue(fut, 0, '0');
    expectValue(fut, new Date(1562057445845), 'Tue Jul 02 2019 20:50:45 GMT+1200 (New Zealand Standard Time)');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle non-string with default', () => {
    const fut = AsString({ default: 'foo' });
    expectValue(fut, null, 'foo');
    expectValue(fut, undefined, 'foo');
    expectValue(fut, 0, '0');
    expectValue(fut, new Date(1562057445845), 'Tue Jul 02 2019 20:50:45 GMT+1200 (New Zealand Standard Time)');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle strings', () => {
    const fut = AsString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = AsString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will limit string length', () => {
    const fut = AsString({ limitLength: 5 });
    expectSuccess(fut, 'asdf');
    expectValue(fut, 'asdfghjk', 'asdfg');
  });

  it('will check regex', () => {
    const fut = AsString({ regex: /^[0-9]{3}$/ });
    expectValue(fut, '123', '123');
    expectValue(fut, 654, '654');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will trim', () => {
    const fut = AsString({ trim: 'both' });
    expectValue(fut, '  123  ', '123');
    expectValue(fut, '123  ', '123');
    expectValue(fut, '  123', '123');
    expectValue(fut, '123', '123');
  });

  it('will trim start', () => {
    const fut = AsString({ trim: 'start' });
    expectValue(fut, '  123  ', '123  ');
    expectValue(fut, '123  ', '123  ');
    expectValue(fut, '  123', '123');
    expectValue(fut, '123', '123');
  });

  it('will trim end', () => {
    const fut = AsString({ trim: 'end' });
    expectValue(fut, '  123  ', '  123');
    expectValue(fut, '123  ', '123');
    expectValue(fut, '  123', '  123');
    expectValue(fut, '123', '123');
  });

  it('will pad start', () => {
    const fut = AsString({ padStart: { length: 6, padWith: '-' } });
    expectValue(fut, '', '------');
    expectValue(fut, 'A', '-----A');
    expectValue(fut, 'ABCDE', '-ABCDE');
    expectValue(fut, 'ABCDEF', 'ABCDEF');
    expectValue(fut, 'ABCDEFGHI', 'ABCDEFGHI');
  });

  it('will pad end', () => {
    const fut = AsString({ padEnd: { length: 6, padWith: '-' } });
    expectValue(fut, '', '------');
    expectValue(fut, 'A', 'A-----');
    expectValue(fut, 'ABCDE', 'ABCDE-');
    expectValue(fut, 'ABCDEF', 'ABCDEF');
    expectValue(fut, 'ABCDEFGHI', 'ABCDEFGHI');
  });

  it('will check custom validator', () => {
    const fut = AsString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = AsString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = AsString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });
});

describe('MaybeAsString', () => {
  it('will handle non-string', () => {
    const fut = MaybeAsString();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, '0');
    expectValue(fut, new Date(1562057445845), 'Tue Jul 02 2019 20:50:45 GMT+1200 (New Zealand Standard Time)');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle non-string with default', () => {
    const fut = MaybeAsString({ default: 'foo' });
    expectValue(fut, null, 'foo');
    expectValue(fut, undefined, 'foo');
    expectValue(fut, 0, '0');
    expectValue(fut, new Date(1562057445845), 'Tue Jul 02 2019 20:50:45 GMT+1200 (New Zealand Standard Time)');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle strings', () => {
    const fut = MaybeAsString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = MaybeAsString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will limit string length', () => {
    const fut = MaybeAsString({ limitLength: 5 });
    expectSuccess(fut, 'asdf');
    expectValue(fut, 'asdfghjk', 'asdfg');
  });

  it('will check regex', () => {
    const fut = MaybeAsString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = MaybeAsString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = MaybeAsString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = MaybeAsString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });
});
