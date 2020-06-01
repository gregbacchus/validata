import { asNumber, isNumber } from './number';
import { isObject } from './object';
import { isRecord, maybeRecord } from './record';
import { asString } from './string';
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
    expectIssue(fut, { a: 'foo' }, 'incorrect-type', ['a']);
  });

  it('will respect min and max number of keys', () => {
    const fut = isRecord(isNumber(), { maxKeys: 4, minKeys: 2 });
    expectIssue(fut, {}, 'min-keys', []);
    expectIssue(fut, { a: 47 }, 'min-keys', []);
    expectSuccess(fut, { a: 47, b: 4, c: 65 });
    expectIssue(fut, { a: 47, b: 4, c: 65, d: 65, e: 76 }, 'max-keys', []);
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

  it('will accept record', () => {
    const fut = maybeRecord(isNumber());
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });
});
