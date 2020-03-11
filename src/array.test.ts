import { IsArray, MaybeArray } from './array';
import { isNumber } from './number';
// import { AsString, IsString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';

// interface MyObject {
//   a: number;
//   b: string;
// }

// interface ParentObject {
//   o: MyObject;
//   s: string;
// }

describe('IsArray', () => {
  it('will fail non-array', () => {
    const fut = IsArray();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will accept array', () => {
    const fut = IsArray();
    expectSuccess(fut, []);
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = IsArray({ minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });

  it('will process items', () => {
    const fut = IsArray({
      item: isNumber({ min: 25 }),
    });
    expectSuccess(fut, []);
    expectSuccess(fut, [87]);
    expectSuccess(fut, [87, 223, 543, 56]);
    expectIssue(fut, [87, 2, 45], 'min', [1]);
    expectIssue(fut, [87, test, 45], 'incorrect-type', [1]);
  });
});

describe('MaybeArray', () => {
  it('will fail non-array', () => {
    const fut = MaybeArray();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, 'test', undefined);
  });

  it('will accept array', () => {
    const fut = MaybeArray();
    expectSuccess(fut, []);
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [1, 2, 3, 4, 5, 'a', 'c']);
  });

  it('will give issue if range outside expected', () => {
    const fut = MaybeArray({ minLength: 1, maxLength: 2 });
    expectIssue(fut, [], 'min-length');
    expectSuccess(fut, [{ a: 47 }]);
    expectSuccess(fut, [12]);
    expectSuccess(fut, [12, 34]);
    expectIssue(fut, [1, 2, 3, 4, 5, 'a', 'c'], 'max-length');
  });
});
