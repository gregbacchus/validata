import { asBoolean, isBoolean, maybeAsBoolean, maybeBoolean } from './boolean';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

describe('isBoolean', () => {
  it('incorrect type will cause an issue', () => {
    const fut = isBoolean();
    runTests(fut,
      { input: 'test', issues: [{ reason: 'incorrect-type' }] },
      { input: 123, issues: [{ reason: 'incorrect-type' }] },
      { input: new Date(), issues: [{ reason: 'incorrect-type' }] },
      { input: [], issues: [{ reason: 'incorrect-type' }] },
      { input: {}, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('null, undefined or NaN will cause an issue', () => {
    const fut = isBoolean();
    runTests(fut,
      { input: null, issues: [{ reason: 'not-defined' }] },
      { input: undefined, issues: [{ reason: 'not-defined' }] },
      { input: NaN, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('will accept boolean', () => {
    const fut = isBoolean();
    expectSuccess(fut, true);
    expectSuccess(fut, false);
  });

  it('will check custom validator', () => {
    const fut = isBoolean({ validator: (value) => !value });
    expectSuccess(fut, false);
    expectIssue(fut, true, 'validator');
  });
});

describe('maybeBoolean', () => {
  it('incorrect type will cause issue', () => {
    const fut = maybeBoolean();
    expectIssue(fut, 'test', 'incorrect-type');
    expectIssue(fut, 123, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('null, undefined will be coerced to undefined', () => {
    const fut = maybeBoolean();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will handle boolean', () => {
    const fut = maybeBoolean();
    expectSuccess(fut, true);
    expectSuccess(fut, false);
  });

  it('will check custom validator', () => {
    const fut = maybeBoolean({ validator: (value) => !value });
    expectSuccess(fut, false);
    expectIssue(fut, true, 'validator');
  });
});

describe('asBoolean', () => {
  it('null or undefined will be an issue', () => {
    const fut = asBoolean();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('incorrect type with no conversion will be an issue', () => {
    const fut = asBoolean();
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
  });

  it('Values will be converted', () => {
    const fut = asBoolean();
    expectValue(fut, 'true', true);
    expectValue(fut, 'false', false);

    expectValue(fut, '', false);
    expectValue(fut, 0, false);
    expectValue(fut, NaN, false);

    expectValue(fut, 1, true);
    expectValue(fut, 123, true);
    expectValue(fut, -123, true);
  });

  it('incorrect type that cannot be converted will have default used', () => {
    const fut = asBoolean({ default: false });
    expectValue(fut, true, true);
    expectValue(fut, false, false);
    expectValue(fut, null, false);
    expectValue(fut, undefined, false);
    expectValue(fut, 'test', false);
    expectValue(fut, '123.4', false);
    expectValue(fut, [], false);
    expectValue(fut, {}, false);
    expectValue(fut, NaN, false);
  });

  it('will handle boolean', () => {
    const fut = asBoolean();
    expectSuccess(fut, true);
    expectSuccess(fut, false);
  });

  it('will check custom validator', () => {
    const fut = asBoolean({ validator: (value) => !value });
    expectSuccess(fut, false);
    expectIssue(fut, true, 'validator');
  });
});

describe('maybeAsBoolean', () => {
  it('incorrect type will be converted to undefined', () => {
    const fut = maybeAsBoolean();
    expectValue(fut, 'test', undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, ['test'], undefined);
    expectValue(fut, {}, undefined);
  });

  it('Values will be converted', () => {
    const fut = maybeAsBoolean();
    expectValue(fut, 'true', true);
    expectValue(fut, 'false', false);

    expectValue(fut, '', false);
    expectValue(fut, 0, false);
    expectValue(fut, NaN, false);

    expectValue(fut, 1, true);
    expectValue(fut, 123, true);
    expectValue(fut, -123, true);
  });

  it('null or undefined will be converted to undefined', () => {
    const fut = maybeAsBoolean();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('incorrect type, null, undefined or NaN that cannot be converted will have default used', () => {
    const fut = maybeAsBoolean({ default: false });
    expectValue(fut, true, true);
    expectValue(fut, false, false);
    expectValue(fut, null, false);
    expectValue(fut, undefined, false);
    expectValue(fut, 'test', false);
    expectValue(fut, '123.4', false);
    expectValue(fut, [], false);
    expectValue(fut, {}, false);
    expectValue(fut, NaN, false);
  });

  it('will handle boolean', () => {
    const fut = maybeAsBoolean();
    expectSuccess(fut, 123);
    expectSuccess(fut, 0);
    expectSuccess(fut, 1.23234);
    expectSuccess(fut, -1.23234);
  });

  it('will check custom validator', () => {
    const fut = maybeAsBoolean({ validator: (value) => !value });
    expectSuccess(fut, false);
    expectIssue(fut, true, 'validator');
  });
});
