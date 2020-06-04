import { asDate, isDate, maybeAsDate, maybeDate } from './date';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

describe('isDate', () => {
  it('incorrect type will cause an issue', () => {
    const fut = isDate();
    runTests(fut,
      { input: 'test', issues: [{ reason: 'incorrect-type' }] },
      { input: 1234, issues: [{ reason: 'incorrect-type' }] },
      { input: [], issues: [{ reason: 'incorrect-type' }] },
      { input: {}, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('null, undefined or NaN will cause an issue', () => {
    const fut = isDate();
    runTests(fut,
      { input: null, issues: [{ reason: 'not-defined' }] },
      { input: undefined, issues: [{ reason: 'not-defined' }] },
      { input: NaN, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('will accept date', () => {
    const fut = isDate();
    expectSuccess(fut, new Date());
  });

  // it('will validate range', () => {
  //   const fut = isDate({ min: 2, max: 5 });
  //   expectSuccess(fut, 4);
  //   expectIssue(fut, 1, 'min');
  //   expectIssue(fut, 8, 'max');
  // });

  // it('will check custom validator', () => {
  //   const fut = isDate({ validator: (value) => value === 7 });
  //   expectSuccess(fut, 7);
  //   expectIssue(fut, 2, 'validator');
  // });
});

describe('maybeDate', () => {
  it('incorrect type will cause issue', () => {
    const fut = maybeDate();
    expectIssue(fut, 'test', 'incorrect-type');
    expectIssue(fut, 123, 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('null, undefined or NaN will be coerced to undefined', () => {
    const fut = maybeDate();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('will handle date', () => {
    const fut = maybeDate();
    expectSuccess(fut, new Date());
  });

  // it('will validate range', () => {
  //   const fut = maybeDate({ min: 2, max: 5 });
  //   expectSuccess(fut, 4);
  //   expectIssue(fut, 1, 'min');
  //   expectIssue(fut, 8, 'max');
  // });

  // it('will check custom validator', () => {
  //   const fut = maybeDate({ validator: (value) => value === 7 });
  //   expectSuccess(fut, 7);
  //   expectIssue(fut, 2, 'validator');
  // });
});

describe('asDate', () => {
  it('null or undefined will be an issue', () => {
    const fut = asDate();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('incorrect type with no conversion will be an issue', () => {
    const fut = asDate();
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
    expectIssue(fut, NaN, 'no-conversion');
  });

  it('Date will be converted', () => {
    const fut = asDate();
    const date = new Date();
    expectValue(fut, date.getTime(), date);
  });

  // it('incorrect type that cannot be converted will have default used', () => {
  //   const fut = asDate({ default: 17.54 });
  //   expectValue(fut, 123.4, 123.4);
  //   expectValue(fut, null, 17.54);
  //   expectValue(fut, undefined, 17.54);
  //   expectValue(fut, 'test', 17.54);
  //   expectValue(fut, '123.4', 123.4);
  //   expectValue(fut, [], 17.54);
  //   expectValue(fut, {}, 17.54);
  //   expectValue(fut, NaN, 17.54);
  // });

  it('will handle date', () => {
    const fut = asDate();
    expectSuccess(fut, 123);
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
    expectSuccess(fut, new Date());
  });

  it('will check custom validator', () => {
    const date = new Date();
    const fut = asDate({ validator: (value) => value.getTime() === date.getTime() });
    expectSuccess(fut, date);
    expectIssue(fut, new Date().setFullYear(2000), 'validator');
  });
});

describe('maybeAsDate', () => {
  it('incorrect type will be converted to undefined', () => {
    const fut = maybeAsDate();
    expectValue(fut, 'test', undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, ['test'], undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('Date will be converted to date', () => {
    const fut = maybeAsDate();
    expectValue(fut, 1562057445845, new Date());
    expectValue(fut, '2013-02-12T08:34:32.120Z', new Date(Date.parse('2013-02-12T08:34:32.120Z')));
  });

  it('null or undefined will be converted to undefined', () => {
    const fut = maybeAsDate();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will handle date', () => {
    const fut = maybeAsDate();
    expectSuccess(fut, 123);
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
    expectSuccess(fut, new Date());
  });

  // it('will coerce range', () => {
  //   const fut = maybeAsDate({ coerceMin: 2, coerceMax: 5 });
  //   expectSuccess(fut, 4);
  //   expectValue(fut, 1, 2);
  //   expectValue(fut, 8, 5);
  // });

  it('will check custom validator', () => {
    const date = new Date();
    const fut = maybeAsDate({ validator: (value) => value.getTime() === date.getTime() });
    expectSuccess(fut, date);
    expectIssue(fut, new Date().setFullYear(2000), 'validator');
  });
});
