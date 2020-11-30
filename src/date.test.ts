import { DateTime, Duration } from 'luxon';
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

  it('will validate future limit', () => {
    const fut = isDate({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() + 60 * 60 * 1_000), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = isDate({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() - 60 * 60 * 1_000), 'max-past');
  });
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
  });

  it('will handle date', () => {
    const fut = maybeDate();
    expectSuccess(fut, new Date());
  });

  it('will validate future limit', () => {
    const fut = maybeDate({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() + 60 * 60 * 1_000), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = maybeDate({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() - 60 * 60 * 1_000), 'max-past');
  });
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

  it('will handle date', () => {
    const fut = asDate();
    expectSuccess(fut, 123);
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
    expectSuccess(fut, new Date());
  });

  it('will use format for convert', () => {
    const fut = asDate({ format: 'dd/MM/yyyy HH:mm:ss' });
    expectSuccess(fut, '27/05/2020 14:06:39');
    expectSuccess(fut, new Date());
  });

  it('will run custom converter', () => {
    const fut = asDate({
      converter: (value, options: { format: string }) => DateTime.fromFormat(value as string, options.format).toJSDate(),
      convertOptions: { format: 'dd/MM/yyyy HH:mm:ss' },
    });
    expectSuccess(fut, '27/05/2020 14:06:39');
    expectSuccess(fut, new Date());
  });

  it('will fall back to built-in converter', () => {
    const fut = asDate({
      converter: (value, options: { format: string }) => DateTime.fromFormat(value as string, options.format).toJSDate(),
      convertOptions: { format: 'dd/MM/yyyy HH:mm:ss' },
    });
    expectSuccess(fut, '2013-02-12T08:34:32.120Z');
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
    expectValue(fut, 1562057445845, new Date(1562057445845));
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

  it('will validate future limit', () => {
    const fut = maybeAsDate({ maxFuture: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() + 60 * 60 * 1_000), 'max-future');
  });

  it('will validate past limit', () => {
    const fut = maybeAsDate({ maxPast: Duration.fromISO('PT10M') });
    expectSuccess(fut, new Date());
    expectIssue(fut, new Date(Date.now() - 60 * 60 * 1_000), 'max-past');
  });

  it('will check custom validator', () => {
    const date = new Date();
    const fut = maybeAsDate({ validator: (value) => value.getTime() === date.getTime() });
    expectSuccess(fut, date);
    expectIssue(fut, new Date().setFullYear(2000), 'validator');
  });
});
