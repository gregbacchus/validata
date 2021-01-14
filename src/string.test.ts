import { dotCase } from 'change-case';
import { DateTime } from 'luxon';
import validator from 'validator';
import { asString, isString, maybeAsString, maybeString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';

// cSpell:disable

describe('isString', () => {
  it('will handle non-string', () => {
    const fut = isString();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle strings', () => {
    const fut = isString();
    expectValue(fut, '', '');
    expectValue(fut, 'asd', 'asd');
    expectValue(fut, '123', '123');
  });

  it('will validate string length', () => {
    const fut = isString({ minLength: 2, maxLength: 5 });
    expectValue(fut, 'asdf', 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will check regex', () => {
    const fut = isString({ regex: /^[0-9]{3}$/ });
    expectValue(fut, '123', '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = isString({ validator: (value) => value === 'test' });
    expectValue(fut, 'test', 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = isString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = isString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });

  it('be transformed by single transform', () => {
    const fut = isString({ transform: dotCase });
    expectValue(fut, '', '');
    expectValue(fut, 'a', 'a');
    expectValue(fut, 'foo bar', 'foo.bar');
    expectValue(fut, 'FooBar', 'foo.bar');
  });

  it('be transformed by single transform', () => {
    const transform = (value: string) => value.replace(/o/g, '*');
    const fut = isString({ transform: [dotCase, transform] });
    expectValue(fut, '', '');
    expectValue(fut, 'a', 'a');
    expectValue(fut, 'foo bar', 'f**.bar');
    expectValue(fut, 'FooBar', 'f**.bar');
  });
});

describe('maybeString', () => {
  it('will handle non-string', () => {
    const fut = maybeString();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle non-string', () => {
    const fut = maybeString({ incorrectTypeToUndefined: true });
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('will handle strings', () => {
    const fut = maybeString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = maybeString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will check regex', () => {
    const fut = maybeString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = maybeString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = maybeString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = maybeString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });
});

describe('asString', () => {
  it('will handle non-string', () => {
    const fut = asString();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectValue(fut, 0, '0');
    expectValue(fut, DateTime.fromMillis(1562057445845, { zone: 'Pacific/Auckland' }).toJSDate(), '2019-07-02T08:50:45.845Z');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle non-string with default', () => {
    const fut = asString({ default: 'foo' });
    expectValue(fut, null, 'foo');
    expectValue(fut, undefined, 'foo');
    expectValue(fut, 0, '0');
    expectValue(fut, DateTime.fromMillis(1562057445845, { zone: 'Pacific/Auckland' }).toJSDate(), '2019-07-02T08:50:45.845Z');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle strings', () => {
    const fut = asString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = asString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will limit string length', () => {
    const fut = asString({ limitLength: 5 });
    expectSuccess(fut, 'asdf');
    expectValue(fut, 'asdfghjk', 'asdfg');
  });

  it('will check regex', () => {
    const fut = asString({ regex: /^[0-9]{3}$/ });
    expectValue(fut, '123', '123');
    expectValue(fut, 654, '654');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will trim', () => {
    const fut = asString({ trim: 'both' });
    expectValue(fut, '  123  ', '123');
    expectValue(fut, '123  ', '123');
    expectValue(fut, '  123', '123');
    expectValue(fut, '123', '123');
  });

  it('will trim start', () => {
    const fut = asString({ trim: 'start' });
    expectValue(fut, '  123  ', '123  ');
    expectValue(fut, '123  ', '123  ');
    expectValue(fut, '  123', '123');
    expectValue(fut, '123', '123');
  });

  it('will trim end', () => {
    const fut = asString({ trim: 'end' });
    expectValue(fut, '  123  ', '  123');
    expectValue(fut, '123  ', '123');
    expectValue(fut, '  123', '  123');
    expectValue(fut, '123', '123');
  });

  it('will pad start', () => {
    const fut = asString({ padStart: { length: 6, padWith: '-' } });
    expectValue(fut, '', '------');
    expectValue(fut, 'A', '-----A');
    expectValue(fut, 'ABCDE', '-ABCDE');
    expectValue(fut, 'ABCDEF', 'ABCDEF');
    expectValue(fut, 'ABCDEFGHI', 'ABCDEFGHI');
  });

  it('will pad end', () => {
    const fut = asString({ padEnd: { length: 6, padWith: '-' } });
    expectValue(fut, '', '------');
    expectValue(fut, 'A', 'A-----');
    expectValue(fut, 'ABCDE', 'ABCDE-');
    expectValue(fut, 'ABCDEF', 'ABCDEF');
    expectValue(fut, 'ABCDEFGHI', 'ABCDEFGHI');
  });

  it('will check custom validator', () => {
    const fut = asString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = asString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = asString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });

  it('will use custom converter', () => {
    const fut = asString({ converter: (value) => value === 1 ? 'one' : undefined });
    expectValue(fut, 1, 'one');
    expectValue(fut, 2, '2');
  });
});

describe('maybeAsString', () => {
  it('will handle non-string', () => {
    const fut = maybeAsString();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, '0');
    expectValue(fut, DateTime.fromMillis(1562057445845, { zone: 'Pacific/Auckland' }).toJSDate(), '2019-07-02T08:50:45.845Z');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle non-string with default', () => {
    const fut = maybeAsString({ default: 'foo' });
    expectValue(fut, null, 'foo');
    expectValue(fut, undefined, 'foo');
    expectValue(fut, 0, '0');
    expectValue(fut, DateTime.fromMillis(1562057445845, { zone: 'Pacific/Auckland' }).toJSDate(), '2019-07-02T08:50:45.845Z');
    expectValue(fut, [], '');
    expectValue(fut, {}, '[object Object]');
  });

  it('will handle strings', () => {
    const fut = maybeAsString();
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = maybeAsString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will limit string length', () => {
    const fut = maybeAsString({ limitLength: 5 });
    expectSuccess(fut, 'asdf');
    expectValue(fut, 'asdfghjk', 'asdfg');
  });

  it('will check regex', () => {
    const fut = maybeAsString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = maybeAsString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = maybeAsString({ validator: validator.isEmail });
    expectSuccess(fut, 'me@home.com');
    expectIssue(fut, 'other', 'validator');
  });

  it('will check custom validator', () => {
    const fut = maybeAsString({ validator: validator.isIn, validatorOptions: ['a', 's'] });
    expectSuccess(fut, 'a');
    expectSuccess(fut, 's');
    expectIssue(fut, 'other', 'validator');
  });

  it('will use custom converter', () => {
    const fut = maybeAsString({ converter: (value) => value === 1 ? 'one' : undefined });
    expectValue(fut, 1, 'one');
    expectValue(fut, 2, '2');
  });
});
