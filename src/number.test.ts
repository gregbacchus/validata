import { AsNumber, IsNumber, MaybeAsNumber, MaybeNumber } from './number';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

describe('IsNumber', () => {
  it('incorrect type will cause an issue', () => {
    const fut = IsNumber();
    runTests(fut,
      { input: 'test', issues: [{ reason: 'incorrect-type' }] },
      { input: new Date(), issues: [{ reason: 'incorrect-type' }] },
      { input: [], issues: [{ reason: 'incorrect-type' }] },
      { input: {}, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('null, undefined or NaN will cause an issue', () => {
    const fut = IsNumber();
    runTests(fut,
      { input: null, issues: [{ reason: 'not-defined' }] },
      { input: undefined, issues: [{ reason: 'not-defined' }] },
      { input: NaN, issues: [{ reason: 'not-a-number' }] },
    );
  });

  it('will accept number', () => {
    const fut = IsNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will validate range', () => {
    const fut = IsNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectIssue(fut, 1, 'min');
    expectIssue(fut, 8, 'max');
  });

  it('will check custom validator', () => {
    const fut = IsNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('MaybeNumber', () => {
  it('incorrect type will cause issue', () => {
    const fut = MaybeNumber();
    expectIssue(fut, 'test', 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('null, undefined or NaN will be coerced to undefined', () => {
    const fut = MaybeNumber();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('will handle number', () => {
    const fut = MaybeNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will validate range', () => {
    const fut = MaybeNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectIssue(fut, 1, 'min');
    expectIssue(fut, 8, 'max');
  });

  it('will check custom validator', () => {
    const fut = MaybeNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('AsNumber', () => {
  it('incorrect type will be converted to number', () => {
    const fut = AsNumber();
    expectValue(fut, null, NaN);
    expectValue(fut, undefined, NaN);
    expectValue(fut, 'test', NaN);
    expectValue(fut, new Date(1562057445845), 1562057445845);
    expectValue(fut, [], NaN);
    expectValue(fut, {}, NaN);
    expectValue(fut, NaN, NaN);
  });

  it('incorrect type that cannot be converted will have default used', () => {
    const fut = AsNumber({ default: 17.54 });
    expectValue(fut, 123.4, 123.4);
    expectValue(fut, null, 17.54);
    expectValue(fut, undefined, 17.54);
    expectValue(fut, 'test', 17.54);
    expectValue(fut, '123.4', 123.4);
    expectValue(fut, [], 17.54);
    expectValue(fut, {}, 17.54);
    expectValue(fut, NaN, 17.54);
  });

  it('will handle number', () => {
    const fut = AsNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
    expectSuccess(fut, '-1.23234');
  });

  it('will validate range', () => {
    const fut = AsNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectValue(fut, 1, 2);
    expectValue(fut, 8, 5);
  });

  it('will check custom validator', () => {
    const fut = AsNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('MaybeAsNumber', () => {
  it('incorrect type will be converted to NaN', () => {
    const fut = MaybeAsNumber();
    expectValue(fut, 'test', NaN);
    expectValue(fut, [], NaN);
    expectValue(fut, ['test'], NaN);
    expectValue(fut, {}, NaN);
    expectValue(fut, NaN, NaN);
  });

  it('Date will be converted to number', () => {
    const fut = MaybeAsNumber();
    expectValue(fut, new Date(1562057445845), 1562057445845);
  });

  it('null or undefined will be converted to NaN', () => {
    const fut = MaybeAsNumber();
    expectValue(fut, null, NaN);
    expectValue(fut, undefined, NaN);
  });

  it('incorrect type, null, undefined or NaN that cannot be converted will have default used', () => {
    const fut = MaybeAsNumber({ default: 17.54 });
    expectValue(fut, 123.4, 123.4);
    expectValue(fut, null, 17.54);
    expectValue(fut, undefined, 17.54);
    expectValue(fut, 'test', 17.54);
    expectValue(fut, '123.4', 123.4);
    expectValue(fut, [], 17.54);
    expectValue(fut, {}, 17.54);
    expectValue(fut, NaN, 17.54);
  });

  it('will handle number', () => {
    const fut = MaybeAsNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will validate range', () => {
    const fut = MaybeAsNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectValue(fut, 1, 2);
    expectValue(fut, 8, 5);
  });

  it('will check custom validator', () => {
    const fut = MaybeAsNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});
