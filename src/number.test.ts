import { asNumber, isNumber, maybeAsNumber, maybeNumber } from './number';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

describe('isNumber', () => {
  it('incorrect type will cause an issue', () => {
    const fut = isNumber();
    runTests(fut,
      { input: 'test', issues: [{ reason: 'incorrect-type' }] },
      { input: new Date(), issues: [{ reason: 'incorrect-type' }] },
      { input: [], issues: [{ reason: 'incorrect-type' }] },
      { input: {}, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('null, undefined or NaN will cause an issue', () => {
    const fut = isNumber();
    runTests(fut,
      { input: null, issues: [{ reason: 'not-defined' }] },
      { input: undefined, issues: [{ reason: 'not-defined' }] },
      { input: NaN, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('will accept number', () => {
    const fut = isNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will validate range', () => {
    const fut = isNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectIssue(fut, 1, 'min');
    expectIssue(fut, 8, 'max');
  });

  it('will check custom validator', () => {
    const fut = isNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('maybeNumber', () => {
  it('incorrect type will cause issue', () => {
    const fut = maybeNumber();
    expectIssue(fut, 'test', 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('null, undefined or NaN will be coerced to undefined', () => {
    const fut = maybeNumber();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('will handle number', () => {
    const fut = maybeNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will validate range', () => {
    const fut = maybeNumber({ min: 2, max: 5 });
    expectSuccess(fut, 4);
    expectIssue(fut, 1, 'min');
    expectIssue(fut, 8, 'max');
  });

  it('will check custom validator', () => {
    const fut = maybeNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('asNumber', () => {
  it('null or undefined will be an issue', () => {
    const fut = asNumber();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('incorrect type with no conversion will be an issue', () => {
    const fut = asNumber();
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
    expectIssue(fut, NaN, 'no-conversion');
  });

  it('Date will be converted', () => {
    const fut = asNumber();
    expectValue(fut, new Date(1562057445845), 1562057445845);
  });

  it('incorrect type that cannot be converted will have default used', () => {
    const fut = asNumber({ default: 17.54 });
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
    const fut = asNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
    expectSuccess(fut, '-1.23234');
  });

  it('will coerce range', () => {
    const fut = asNumber({ coerceMin: 2, coerceMax: 5 });
    expectSuccess(fut, 4);
    expectValue(fut, 1, 2);
    expectValue(fut, 8, 5);
  });

  it('will check custom validator', () => {
    const fut = asNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});

describe('maybeAsNumber', () => {
  it('incorrect type will be converted to undefined', () => {
    const fut = maybeAsNumber();
    expectValue(fut, 'test', undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, ['test'], undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('Date will be converted to number', () => {
    const fut = maybeAsNumber();
    expectValue(fut, new Date(1562057445845), 1562057445845);
  });

  it('null or undefined will be converted to undefined', () => {
    const fut = maybeAsNumber();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('incorrect type, null, undefined or NaN that cannot be converted will have default used', () => {
    const fut = maybeAsNumber({ default: 17.54 });
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
    const fut = maybeAsNumber();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will coerce range', () => {
    const fut = maybeAsNumber({ coerceMin: 2, coerceMax: 5 });
    expectSuccess(fut, 4);
    expectValue(fut, 1, 2);
    expectValue(fut, 8, 5);
  });

  it('will check custom validator', () => {
    const fut = maybeAsNumber({ validator: (value) => value === 7 });
    expectSuccess(fut, 7);
    expectIssue(fut, 2, 'validator');
  });
});
