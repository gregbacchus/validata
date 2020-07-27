import { ulid } from 'ulid';
import { isString } from './string';
import { expectIssue, expectSuccess, expectValue } from './test-helpers';
import { isUlid, maybeUlid } from './ulid';

// cSpell:disable

describe('isUlid', () => {
  it('will handle non-ulid', () => {
    const fut = isUlid();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, '', 'incorrect-type');
    expectIssue(fut, '01EDE4G0MEMB17NSRBHX0G08DL', 'incorrect-type');
  });

  it('will handle ulid', () => {
    const fut = isUlid();
    const testUlid1 = ulid();
    const testUlid2 = ulid();
    const testUlid3 = ulid();
    expectValue(fut, testUlid1, testUlid1);
    expectValue(fut, testUlid2, testUlid2);
    expectValue(fut, testUlid3, testUlid3);
  });

  it('will check custom validator', () => {
    const fut = isString({ validator: (value) => value === '01EDE4G0MEMB17NSRBHX0G08DX' });
    expectValue(fut, '01EDE4G0MEMB17NSRBHX0G08DX', '01EDE4G0MEMB17NSRBHX0G08DX');
    expectIssue(fut, '01EDE4XFCA9H42A08BTQ38X9WZ', 'validator');
  });
});

describe('maybeUlid', () => {
  it('will handle non-ulid', () => {
    const fut = maybeUlid();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
    expectIssue(fut, '', 'incorrect-type');
    expectIssue(fut, '01EDE4G0MEMB17NSRBHX0G08DL', 'incorrect-type');
  });

  it('will handle non-ulid', () => {
    const fut = maybeUlid({ incorrectTypeToUndefined: true });
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, '', undefined);
    expectValue(fut, '01EDE4G0MEMB17NSRBHX0G08DL', undefined);
  });

  it('will handle ulids', () => {
    const fut = maybeUlid();
    expectSuccess(fut, ulid());
    expectSuccess(fut, ulid());
    expectSuccess(fut, ulid());
  });

  it('will check custom validator', () => {
    const fut = maybeUlid({ validator: (value) => value === '01EDE4G0MEMB17NSRBHX0G08DX' });
    expectSuccess(fut, '01EDE4G0MEMB17NSRBHX0G08DX');
    expectIssue(fut, '01EDE4XFCA9H42A08BTQ38X9WZ', 'validator');
  });
});
