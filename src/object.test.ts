import { asNumber, isNumber } from './number';
import { isObject, maybeObject } from './object';
import { asString, isString } from './string';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

interface MyObject {
  a: number;
  b: string;
}

interface ParentObject {
  o: MyObject;
  s: string;
}

describe('isObject', () => {
  it('will fail non-object', () => {
    const fut = isObject();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept object', () => {
    const fut = isObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });

  it('will process children', () => {
    const fut = isObject<MyObject>({
      a: asNumber({ coerceMin: 25 }),
      b: asString(),
    });
    expectValue(fut, { a: 47, b: 'asd' }, { a: 47, b: 'asd' });
    expectValue(fut, { a: '47', b: 12 }, { a: 47, b: '12' });
    expectValue(fut, { a: '7', b: 12 }, { a: 25, b: '12' });
  });

  it('will process nested children', () => {
    const fut = isObject<ParentObject>({
      o: isObject<MyObject>({
        a: isNumber(),
        b: asString(),
      }),
      s: asString(),
    });
    runTests(fut,
      {
        input: { o: 47, s: 'asd' },
        issues: [{ reason: 'incorrect-type', path: ['o'] }],
      },
      {
        input: { o: {}, s: 'asd' },
        issues: [{ reason: 'not-defined', path: ['o', 'a'] }],
      },
      {
        input: { o: { a: 'hello', b: 'hello' }, s: 'asd' },
        issues: [{ reason: 'incorrect-type', path: ['o', 'a'] }],
      },
      {
        expect: { o: { a: 12, b: '12' }, s: 'asd' },
        input: { o: { a: 12, b: 12 }, s: 'asd' },
      },
    );
  });

  it('will process children', () => {
    const fut = isObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    });
    expectValue(fut, { a: 47, b: 'asd' }, { a: 47, b: 'asd' });
    expectIssue(fut, { a: '47', b: 'asd' }, 'incorrect-type', ['a']);
    expectIssue(fut, { a: 47, b: 'asd', c: 234 }, 'unexpected-property', ['c']);
    expectIssue(fut, {}, 'not-defined', ['a']);
    expectIssue(fut, {}, 'not-defined', ['b']);
  });

  it('will error on unexpected properties', () => {
    const fut = isObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    });
    expectIssue(fut, { a: 47, b: 'asd', c: 234 }, 'unexpected-property', ['c']);
  });

  it('will strip unexpected properties', () => {
    const fut = isObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    }, { stripExtraProperties: true });
    expectValue(fut, { a: 47, b: 'asd', c: 345, d: 'hello' }, { a: 47, b: 'asd' });
  });
});

describe('maybeObject', () => {
  it('will coerce null and undefined', () => {
    const fut = maybeObject();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will fail non-object', () => {
    const fut = maybeObject();
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept object', () => {
    const fut = maybeObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });
});
