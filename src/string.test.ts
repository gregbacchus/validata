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
    expectSuccess(fut, '');
    expectSuccess(fut, 'asd');
    expectSuccess(fut, '123');
  });

  it('will validate string length', () => {
    const fut = IsString({ minLength: 2, maxLength: 5 });
    expectSuccess(fut, 'asdf');
    expectIssue(fut, 'a', 'min-length');
    expectIssue(fut, 'asdfghjk', 'max-length');
  });

  it('will check regex', () => {
    const fut = IsString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
  });

  it('will check custom validator', () => {
    const fut = IsString({ validator: (value) => value === 'test' });
    expectSuccess(fut, 'test');
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
    expectValue(fut, null, 'null');
    expectValue(fut, undefined, 'undefined');
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
    expectValue(fut, 'asdfghjk', 'asdfg');
  });

  it('will check regex', () => {
    const fut = AsString({ regex: /^[0-9]{3}$/ });
    expectSuccess(fut, '123');
    expectIssue(fut, 'as', 'regex');
    expectIssue(fut, '12', 'regex');
    expectIssue(fut, '12345', 'regex');
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