import { jsonDateParser } from 'json-date-parser';
import { isDate } from './date';
import { asNumber, isNumber } from './number';
import { asObject, isObject, maybeAsObject, maybeObject } from './object';
import { asString, isString } from './string';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';
import { isIssue } from './types';

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

  it('will accept non-object if requested', () => {
    const fut = maybeObject({}, { incorrectTypeToUndefined: true });
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will accept object', () => {
    const fut = maybeObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });
});

describe('asObject', () => {
  it('will fail non-object', () => {
    const fut = asObject();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'no-conversion');
    expectIssue(fut, new Date(), 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, 'test', 'no-conversion');
  });

  it('will accept object', () => {
    const fut = asObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });

  it('will process children', () => {
    const fut = asObject<MyObject>({
      a: asNumber({ coerceMin: 25 }),
      b: asString(),
    });
    expectValue(fut, { a: 47, b: 'asd' }, { a: 47, b: 'asd' });
    expectValue(fut, { a: '47', b: 12 }, { a: 47, b: '12' });
    expectValue(fut, { a: '7', b: 12 }, { a: 25, b: '12' });
  });

  it('will process nested children', () => {
    const fut = asObject<ParentObject>({
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
    const fut = asObject<MyObject>({
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
    const fut = asObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    });
    expectIssue(fut, { a: 47, b: 'asd', c: 234 }, 'unexpected-property', ['c']);
  });

  it('will strip unexpected properties', () => {
    const fut = asObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    }, { stripExtraProperties: true });
    expectValue(fut, { a: 47, b: 'asd', c: 345, d: 'hello' }, { a: 47, b: 'asd' });
  });

  describe('string parsing', () => {
    const fut = asObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    });

    it('will fail empty string', () => {
      expectIssue(fut, '', 'no-conversion');
    });

    it('will fail nonJSON string', () => {
      expectIssue(fut, 'testing', 'no-conversion');
    });

    it('will fail invalid JSON string', () => {
      expectIssue(fut, '{testing=12}', 'no-conversion');
      expectIssue(fut, '{testing:12}', 'no-conversion');
    });

    it('will parse valid JSON string that matches requirements', () => {
      expectValue(fut, '{"a": 123, "b": "test"}', { a: 123, b: 'test' });
    });

    it('will parse valid JSON string that doesn\'t match requirements', () => {
      expectIssue(fut, '{}', 'not-defined', ['a']);
      expectIssue(fut, '{}', 'not-defined', ['b']);
      expectIssue(fut, '{"a": "123", "b": "test"}', 'incorrect-type', ['a']);
    });
  });
});

describe('maybeAsObject', () => {
  it('will coerce null and undefined', () => {
    const fut = maybeAsObject();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will convert non-object to undefined', () => {
    const fut = maybeAsObject();
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will fail invalid JSON string when parsing is strict', () => {
    const fut = maybeAsObject({}, { strictParsing: true });
    expectIssue(fut, 0, 'no-conversion');
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, '{testing=12}', 'no-conversion');
    expectIssue(fut, '{testing:12}', 'no-conversion');
  });

  it('will accept non-object if requested', () => {
    const fut = maybeAsObject({}, { incorrectTypeToUndefined: true });
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will accept object', () => {
    const fut = maybeAsObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });

  describe('string parsing', () => {
    const fut = maybeAsObject<MyObject>({
      a: isNumber({ min: 25 }),
      b: isString(),
    });

    it('will convert empty string to undefined', () => {
      expectValue(fut, '', undefined);
    });

    it('will convert nonJSON string to undefined', () => {
      expectValue(fut, 'testing', undefined);
    });

    it('will convert invalid JSON string to undefined', () => {
      expectValue(fut, '{testing=12}', undefined);
      expectValue(fut, '{testing:12}', undefined);
    });

    it('will use custom converter', () => {
      type TestDateType = { d: Date };
      const fut = asObject<TestDateType>(
        { d: isDate() },
        { converter: (value) => typeof value !== 'string' ? undefined : JSON.parse(value, jsonDateParser) as TestDateType }
      );
      expectIssue(fut, '{"d":12}', 'incorrect-type', ['d']);

      const date = '2021-01-13T20:23:36.164Z';
      const r = fut.process(`{"d":"${date}"}`);
      expect(r).toBeDefined();
      if (isIssue(r)) {
        fail(`Unexpected issue: ${JSON.stringify(r)}`);
      }
      expect(r.value.d.constructor.name).toEqual('Date');
      expect(r.value.d.getTime()).toEqual(new Date(date).getTime());
    });

    it('will parse valid JSON string that matches requirements', () => {
      expectValue(fut, '{"a": 123, "b": "test"}', { a: 123, b: 'test' });
    });

    it('will parse valid JSON string that doesn\'t match requirements', () => {
      expectIssue(fut, '{}', 'not-defined', ['a']);
      expectIssue(fut, '{}', 'not-defined', ['b']);
      expectIssue(fut, '{"a": "123", "b": "test"}', 'incorrect-type', ['a']);
    });
  });
});
