import { isAny } from './any';
import { asNumber, isNumber } from './number';
import { isObject } from './object';
import { asRecord, isRecord, maybeAsRecord, maybeRecord } from './record';
import { asString, isString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';

interface MyObject {
  a: number;
  b: string;
}

describe('isRecord', () => {
  it('will fail non-object', () => {
    const fut = isRecord(isNumber());
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept record', () => {
    const fut = isRecord(isNumber());
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
    expectValue(fut, { a: 47 }, { a: 47 });
    expectIssue(fut, { a: 'foo' }, 'incorrect-type', ['a']);
  });

  it('will respect min and max number of keys', () => {
    const fut = isRecord(isNumber(), { maxKeys: 4, minKeys: 2 });
    expectIssue(fut, {}, 'min-keys', []);
    expectIssue(fut, { a: 47 }, 'min-keys', []);
    expectSuccess(fut, { a: 47, b: 4, c: 65 });
    expectIssue(fut, { a: 47, b: 4, c: 65, d: 65, e: 76 }, 'max-keys', []);
  });

  it('will check key names', () => {
    const fut = isRecord(isAny(), { keyRegex: /^test/ });
    expectIssue(fut, { a: 324 }, 'key-regex', []);
    expectIssue(fut, { test: 47, Test: 'q34' }, 'key-regex', []);
    expectSuccess(fut, { test: 47, tester: 4, testing: 65 });
  });

  it('will check key names - exclude chars', () => {
    const fut = isRecord(isAny(), { keyRegex: /^[^.$]+$/ });
    expectIssue(fut, { 'hello.world': 324 }, 'key-regex', []);
    expectIssue(fut, { test: 47, $id: 'q34' }, 'key-regex', []);
    expectSuccess(fut, { foo: 47, bar: 4, testing: 65 });
  });

  it('will process children', () => {
    const fut = isRecord<MyObject>(isObject({
      a: asNumber({ coerceMin: 25 }),
      b: asString(),
    }));
    expectValue(fut, { foo: { a: 47, b: 'asd' } }, { foo: { a: 47, b: 'asd' } });
    expectValue(fut, { foo: { a: '47', b: 12 } }, { foo: { a: 47, b: '12' } });
    expectValue(fut, { foo: { a: '7', b: 12 } }, { foo: { a: 25, b: '12' } });
  });
});

describe('maybeRecord', () => {
  it('will coerce null and undefined', () => {
    const fut = maybeRecord(isNumber());
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will fail non-object', () => {
    const fut = maybeRecord(isNumber());
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will be graceful with non-object', () => {
    const fut = maybeRecord(isNumber(), { incorrectTypeToUndefined: true });
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will accept record', () => {
    const fut = maybeRecord(isNumber());
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });
});

describe('asRecord', () => {
  it('will fail null or undefined', () => {
    const fut = asRecord(isNumber());
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('will use default', () => {
    const fut = asRecord(isNumber(), { default: { a: 47 } });
    expectValue(fut, null, { a: 47 });
    expectValue(fut, undefined, { a: 47 });
  });

  it('will accept string values in record', () => {
    const fut = asRecord(isString());
    expectValue(fut, '{ \"fruit\": \"apple\" }', { fruit: 'apple' });
  });
});

describe('maybeAsRecord', () => {
  it('will coerce null and undefined', () => {
    const fut = maybeAsRecord();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will use default', () => {
    const fut = maybeAsRecord(asNumber(), { default: { a: 47 } });
    expectValue(fut, null, { a: 47 });
    expectValue(fut, undefined, { a: 47 });
  });

  it('will convert non-object to undefined', () => {
    const fut = maybeAsRecord();
    expectValue(fut, '', undefined);
    expectValue(fut, false, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });
});
