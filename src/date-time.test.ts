import { DateTime, Duration } from 'luxon';
import { asDateTime, isDateTime, maybeAsDateTime, maybeDateTime } from './date-time';
import { expectIssue, expectSuccess, expectValue, runTests } from './test-helpers';

describe('isDateTime', () => {
  it('incorrect type will cause an issue', () => {
    const fut = isDateTime();
    runTests(fut,
      { input: 'test', issues: [{ reason: 'incorrect-type' }] },
      { input: 1234, issues: [{ reason: 'incorrect-type' }] },
      { input: [], issues: [{ reason: 'incorrect-type' }] },
      { input: {}, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('null, undefined or NaN will cause an issue', () => {
    const fut = isDateTime();
    runTests(fut,
      { input: null, issues: [{ reason: 'not-defined' }] },
      { input: undefined, issues: [{ reason: 'not-defined' }] },
      { input: NaN, issues: [{ reason: 'incorrect-type' }] },
    );
  });

  it('will accept date', () => {
    const fut = isDateTime();
    expectSuccess(fut, DateTime.local());
  });

  it('will validate future limit', () => {
    const fut = isDateTime({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().plus(Duration.fromISO('PT20M')), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = isDateTime({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().minus(Duration.fromISO('PT20M')), 'max-past');
  });
});

describe('maybeDateTime', () => {
  it('incorrect type will cause issue', () => {
    const fut = maybeDateTime();
    expectIssue(fut, 'test', 'incorrect-type');
    expectIssue(fut, 123, 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('incorrect type will not cause issue if muted', () => {
    const fut = maybeDateTime({ incorrectTypeToUndefined: true });
    expectValue(fut, 'test', undefined);
    expectValue(fut, 123, undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('null, undefined or NaN will be coerced to undefined', () => {
    const fut = maybeDateTime();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will handle date', () => {
    const fut = maybeDateTime();
    expectSuccess(fut, DateTime.local());
  });

  it('will validate future limit', () => {
    const fut = maybeDateTime({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().plus(Duration.fromISO('PT20M')), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = maybeDateTime({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().minus(Duration.fromISO('PT20M')), 'max-past');
  });
});

describe('asDateTime', () => {
  it('null or undefined will be an issue', () => {
    const fut = asDateTime();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
  });

  it('incorrect type with no conversion will be an issue', () => {
    const fut = asDateTime();
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
    expectIssue(fut, NaN, 'no-conversion');
  });

  it('Date will be converted', () => {
    const fut = asDateTime();
    const date = DateTime.utc();
    expectValue(fut, date.toMillis(), date);
  });

  it('Date will be converted with custom converter', () => {
    const fut = asDateTime({ converter: (value) => value === 'now' ? DateTime.utc() : undefined });
    expectSuccess(fut, 'now');
    expectIssue(fut, 'test', 'no-conversion');
  });

  it('will handle date', () => {
    const fut = asDateTime();
    expectSuccess(fut, 123);
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
    expectSuccess(fut, new Date());
  });

  it('will check custom validator', () => {
    const date = DateTime.utc();
    const fut = asDateTime({ validator: (value) => value.toMillis() === date.toMillis() });
    expectSuccess(fut, date);
    expectIssue(fut, new Date().setFullYear(2000), 'validator');
  });
});

describe('maybeAsDateTime', () => {
  it('incorrect type will be converted to undefined', () => {
    const fut = maybeAsDateTime();
    expectValue(fut, 'test', undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, ['test'], undefined);
    expectValue(fut, {}, undefined);
    expectValue(fut, NaN, undefined);
  });

  it('incorrect type will result in issue when parsing is strict', () => {
    const fut = maybeAsDateTime({ strictParsing: true });
    expectIssue(fut, 'test', 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, ['test'], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
    expectIssue(fut, NaN, 'no-conversion');
  });

  it('Date will be converted to date', () => {
    const fut = maybeAsDateTime();
    expectValue(fut, 1562057445845, DateTime.fromMillis(1562057445845).toUTC());
    expectValue(fut, '2013-02-12T08:34:32.120Z', DateTime.fromISO('2013-02-12T08:34:32.120Z').toUTC());
  });

  it('null or undefined will be converted to undefined', () => {
    const fut = maybeAsDateTime();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
  });

  it('will handle date', () => {
    const fut = maybeAsDateTime();
    expectSuccess(fut, 123);
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
    expectSuccess(fut, new Date());
  });

  it('will validate future limit', () => {
    const fut = maybeAsDateTime({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().plus(Duration.fromISO('PT20M')), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = maybeAsDateTime({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, DateTime.local());
    expectIssue(fut, DateTime.local().minus(Duration.fromISO('PT20M')), 'max-past');
  });

  it('will check custom validator', () => {
    const date = DateTime.utc();
    const fut = maybeAsDateTime({ validator: (value) => value.toMillis() === date.toMillis() });
    expectSuccess(fut, date);
    expectIssue(fut, new Date().setFullYear(2000), 'validator');
  });
});
