import { DateTime } from 'luxon';
import { asArray, isArray, maybeArray, maybeAsArray } from './array';
import { asBoolean, isBoolean, maybeAsBoolean, maybeBoolean } from './boolean';
import { nullOr, ValueProcessorFactory } from './common';
import { asDate, isDate, maybeAsDate, maybeDate } from './date';
import { asDateTime, isDateTime, maybeAsDateTime, maybeDateTime } from './date-time';
import { asNumber, isNumber, maybeAsNumber, maybeNumber } from './number';
import { asObject, isObject, maybeAsObject, maybeObject } from './object';
import { isRecord, maybeRecord } from './record';
import { asString, isString, maybeAsString, maybeString } from './string';
import { expectValue } from './test-helpers';
import { isTuple, maybeTuple } from './tuple';
import { asUrl, isUrl, maybeAsUrl, maybeUrl } from './url';

describe('createNullableCheck', () => {
  it.each([
    [isArray, ['a', 'b']],
    [maybeArray, undefined],
    [asArray, 'a'],
    [maybeAsArray, undefined],

    [isBoolean, true],
    [maybeBoolean, undefined],
    [asBoolean, 'false'],
    [maybeAsBoolean, undefined],

    [isDateTime, DateTime.local()],
    [maybeDateTime, undefined],
    [asDateTime, DateTime.local().toISO()],
    [maybeAsDateTime, undefined],

    [isDate, new Date()],
    [maybeDate, undefined],
    [asDate, new Date().toISOString()],
    [maybeAsDate, undefined],

    [isNumber, 5],
    [maybeNumber, undefined],
    [asNumber, '5'],
    [maybeAsNumber, undefined],

    [isObject, { a: 1, b: '2' }],
    [maybeObject, undefined],
    [asObject, '{ "a": 42 }', { a: isNumber() }],
    [maybeAsObject, undefined],

    [isRecord, { a: 1, b: '2' }],
    [maybeRecord, undefined],

    [isString, 'asd'],
    [maybeString, undefined],
    [asString, 'asd'],
    [maybeAsString, undefined],

    [isTuple, [2], [isNumber()]],
    [maybeTuple, undefined],

    [isUrl, new URL('http://localhost')],
    [maybeUrl, undefined],
    [asUrl, new URL('http://localhost').toString()],
    [maybeAsUrl, undefined],
  ])('createNullableCheck %#', (check: ValueProcessorFactory<unknown, any>, value: unknown, contract: unknown = undefined) => {
    const fut = check(contract);
    const futNull = nullOr(check)(contract);
    expectValue(futNull, null, null);
    expect(fut.process(value)).toEqual(futNull.process(value));
  });
});
