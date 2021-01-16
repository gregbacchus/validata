import { asArray, isArray, maybeArray, maybeAsArray } from './array';
import { isNumber } from './number';
import { isString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';

describe('isArray', () => {
  it('will fail non-array', () => {
    const fut = isArray();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept array', () => {
    const fut = isArray();
    expectSuccess(fut, []);
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = isArray(undefined, { minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });

  it('will process items', () => {
    const fut = isArray(isNumber({ coerceMax: 500, min: 25 }));
    expectSuccess(fut, []);
    expectSuccess(fut, [87]);
    expectValue(fut, [87, 223, 543, 56], [87, 223, 500, 56]);
    expectIssue(fut, [87, 2, 45], 'min', [1]);
    expectIssue(fut, [87, test, 45], 'incorrect-type', [1]);
  });
});

describe('maybeArray', () => {
  it('will fail non-array', () => {
    const fut = maybeArray();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept non-array with undefined if requested', () => {
    const fut = maybeArray(undefined, { incorrectTypeToUndefined: true });
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will accept array', () => {
    const fut = maybeArray();
    expectSuccess(fut, []);
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = maybeArray(undefined, { minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });
});

describe('asArray', () => {
  it('will fail null or undefined', () => {
    const fut = asArray();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('will convert non-array', () => {
    const fut = asArray();
    const date = new Date();
    expectValue(fut, 0, [0]);
    expectValue(fut, date, [date]);
    expectValue(fut, {}, [{}]);
    expectValue(fut, 'test', ['test']);
  });

  it('will accept array', () => {
    const fut = asArray();
    expectValue(fut, [], []);
    expectValue(fut, [{ a: 47 }], [{ a: 47 }]);
    expectValue(fut, [12], [12]);
    expectValue(fut, [1, 2, 3, 4, 5, 'a', 'c'], [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = asArray(undefined, { minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });

  it('will process items', () => {
    const fut = asArray(isNumber({ coerceMax: 500, min: 25 }));
    expectSuccess(fut, []);
    expectSuccess(fut, [87]);
    expectValue(fut, [87, 223, 543, 56], [87, 223, 500, 56]);
    expectIssue(fut, [87, 2, 45], 'min', [1]);
    expectIssue(fut, [87, test, 45], 'incorrect-type', [1]);
  });
});

describe('maybeAsArray', () => {
  it('will not convert null or undefined', () => {
    const fut = maybeAsArray();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will convert non-array', () => {
    const fut = maybeAsArray();
    const date = new Date();
    expectValue(fut, 0, [0]);
    expectValue(fut, date, [date]);
    expectValue(fut, {}, [{}]);
    expectValue(fut, 'test', ['test']);
  });

  it('will use custom converter', () => {
    const fut = maybeAsArray(isString(), { converter: (value) => value === 'one and two' ? ['1', '2'] : undefined });
    expectValue(fut, 'one and two', ['1', '2']);
    expectValue(fut, 'three', ['three']);
  });

  it('will accept array', () => {
    const fut = maybeAsArray();
    expectValue(fut, [], []);
    expectValue(fut, [{ a: 47 }], [{ a: 47 }]);
    expectValue(fut, [12], [12]);
    expectValue(fut, [1, 2, 3, 4, 5, 'a', 'c'], [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = maybeAsArray(undefined, { minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });
});
