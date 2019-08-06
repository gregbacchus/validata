import { AsNumber, IsNumber } from './number';
import { IsObject, MaybeObject } from './object';
import { AsString, IsString } from './string';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

interface MyObject {
  a: number;
  b: string;
}

interface ParentObject {
  o: MyObject;
  s: string;
}

describe('IsObject', () => {
  it('will handle non-object', () => {
    const fut = IsObject();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will handle object', () => {
    const fut = IsObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });

  it('will process children', () => {
    const fut = IsObject<MyObject>({
      contract: {
        a: AsNumber({ min: 25 }),
        b: AsString(),
      },
    });
    expectValue(fut, { a: 47, b: 'asd' }, { a: 47, b: 'asd' });
    expectValue(fut, { a: '47', b: 12 }, { a: 47, b: '12' });
    expectValue(fut, { a: '7', b: 12 }, { a: 25, b: '12' });
  });

  it('will process nested children', () => {
    const fut = IsObject<ParentObject>({
      contract: {
        o: IsObject({
          contract: {
            a: IsNumber(),
            b: AsString(),
          },
        }),
        s: AsString(),
      },
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
    const fut = IsObject<MyObject>({
      contract: {
        a: IsNumber({ min: 25 }),
        b: IsString(),
      },
    });
    expectValue(fut, { a: 47, b: 'asd' }, { a: 47, b: 'asd' });
    expectIssue(fut, { a: '47', b: 'asd' }, 'incorrect-type', ['a']);
    expectIssue(fut, { a: 47, b: 'asd', c: 234 }, 'unexpected-property', ['c']);
    expectIssue(fut, {}, 'not-defined', ['a']);
    expectIssue(fut, {}, 'not-defined', ['b']);
  });

});

describe('MaybeObject', () => {
  it('will handle non-object', () => {
    const fut = MaybeObject();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will handle object', () => {
    const fut = MaybeObject();
    expectSuccess(fut, {});
    expectSuccess(fut, { a: 47 });
  });

});
