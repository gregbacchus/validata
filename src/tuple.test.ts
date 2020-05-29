import { isNumber } from './number';
import { isString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';
import { isTuple, maybeTuple } from './tuple';

describe('isTuple', () => {
  it('will fail non-tuple', () => {
    const fut = isTuple([]);
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will validate tuple', () => {
    const fut = isTuple([
      isNumber(),
      isString(),
    ]);
    expectSuccess(fut, [2, 'sd']);
    expectIssue(fut, [2], 'expected-item', [1]);
    expectIssue(fut, [-2, 0], 'incorrect-type', [1]);
    expectIssue(fut, [-2, undefined], 'not-defined', [1]);
    expectIssue(fut, [-2, 'string', 23], 'unexpected-item', [2]);
    expectIssue(fut, [-2, 'string', undefined], 'unexpected-item', [2]);
  });

  it('will validate tuple', () => {
    const fut = isTuple([]);
    expectIssue(fut, [2], 'unexpected-item', [0]);
    expectIssue(fut, [2, 'test'], 'unexpected-item', [0]);
    expectIssue(fut, [2, 'test'], 'unexpected-item', [1]);
    expectIssue(fut, [undefined], 'unexpected-item', [0]);
  });
});

describe('maybeTuple', () => {
  it('will fail non-tuple', () => {
    const fut = maybeTuple([]);
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, 'test', 'incorrect-type');
  });

  it('will validate tuple', () => {
    const fut = maybeTuple([
      isNumber(),
      isString(),
    ]);
    expectSuccess(fut, [2, 'sd']);
    expectIssue(fut, [2], 'expected-item', [1]);
    expectIssue(fut, [-2, 0], 'incorrect-type', [1]);
    expectIssue(fut, [-2, undefined], 'not-defined', [1]);
    expectIssue(fut, [-2, 'string', 23], 'unexpected-item', [2]);
    expectIssue(fut, [-2, 'string', undefined], 'unexpected-item', [2]);
  });

  it('will validate tuple', () => {
    const fut = maybeTuple([]);
    expectIssue(fut, [2], 'unexpected-item', [0]);
    expectIssue(fut, [2, 'test'], 'unexpected-item', [0]);
    expectIssue(fut, [2, 'test'], 'unexpected-item', [1]);
    expectIssue(fut, [undefined], 'unexpected-item', [0]);
  });
});
