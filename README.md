# Validata

Type safe data validation and sanitization.

See [validata-koa](https://www.npmjs.com/package/validata-koa) for more usage in [Koa](https://www.npmjs.com/package/koa).

## Getting started

```bash
npm i validata
```

## Basic usage

```typescript
import { asString, isObject, isString, maybeString } from 'validata';

interface Sample {
  maybeString: string | undefined;
  myString: string;
  numericString: string;
}

const sample = isObject<Sample>({
  maybeString: maybeString(), // will allow string data type or sanitize to undefined
  myString: isString(), // will allow only string data type
  numericString: isString(), // will allow string or attempt to convert to string
});

console.log(sample.process({
  maybeString: 123,
  myString: '123',
  numericString: 123,
}));

/*
Outputs:
{ value: { maybeString: undefined, myString: '123', numericString: '123' } }
*/

console.log(sample.process({
  maybeString: 123,
  myString: 123,
  numericString: 123,
}));

/*
Outputs:
{ issues: [ { path: ['myString'], value: 123, reason: 'incorrect-type'}]}
*/
```

## API

Checks:

* isArray
* maybeArray
* isDate
* maybeDate
* asDate
* maybeAsDate
* isNumber
* maybeNumber
* asNumber
* maybeAsNumber
* isObject
* maybeObject
* asObject
* maybeAsObject
* isRecord
* maybeRecord
* isString
* maybeString
* asString
* maybeAsString
* isTuple
* maybeTuple

Work is done by a typed `ValueProcessor`, as returned by`isObject<T>()` or `asNumber()`.

```typescript
interface ValueProcessor<T> {
  process(value: unknown): Result<T>;
}
```

The `process()` method returns a `Result<T>`.The `Result` is either a list of issues
(meaning validation failures) or the accepted value (it may be coerced/altered from the original).

```typescript
type Result<T> = ValueResult<T> | IssueResult;

interface ValueResult<T> {
  value: T;
}

interface IssueResult {
  issues: Issue[];
}
```

## Naming conventions

### `is...` e.g. `isNumber`

* if the value is of the type it will be accepted
* `null` or `undefined` cause an issue
* otherwise it will cause an issue

### `maybe...` e.g. `maybeNumber`

* if the value is of the type it will be accepted
* `null` or `undefined` it will sanitized to undefined
* otherwise it will cause an issue

### `as...` e.g. `asNumber`

* if the value is of the type it will be accepted
* `null` or `undefined` converted to default, if provided, or cause an issue
* if the value can be converted to the type, it will be converted and used
* if the value is cannot be converted the default will be used if provided
* otherwise it will cause an issue

### `maybeAs...` e.g. `maybeAsNumber`

* if the value is of the type it will be accepted
* `null` or `undefined` converted to default, if provided, or sanitized to undefined
* if the value can be converted to the type it will be converted and used
* if the value is cannot be converted the default will be used if provided
* otherwise it will cause an issue
// * otherwise it will be sanitized to undefined

## Checks

### `isArray`, `maybeArray`

Usage:

```typescript
isArray(itemProcessor, options);
maybeArray(itemProcessor, options);
```

Options:

* `coerceMaxLength? number` - if there are more items than this, some will be removed
* `maxLength?: number` - if there are more items than this, it's an error `max-length`
* `minLength?: number` - if there are less items than this, it's an error `min-length`
* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

Example:

```typescript
isArray<number>(isNumber({ max: 20, min: 10}), { coerceMaxLength: 7 });
```

### `isDate`, `maybeDate`, `asDate`, `maybeAsDate`

Usage:

```typescript
isDate(options);
maybeDate(options);
asDate(options);
maybeAsDate(options);
```

Options:

* `maxFuture?: Duration` - if the value is after this duration into the future, it's an error `max-future`
* `maxPast?: Duration` - if the value is before this duration into the past, it's an error `max-past`
* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

### `isNumber`, `maybeNumber`, `asNumber`, `maybeAsNumber`

Usage:

```typescript
isNumber(options);
maybeNumber(options);
asNumber(options);
maybeAsNumber(options);
```

Options:

* `coerceMin?: number` - if the value is less than this, it will be set to this value
* `coerceMax?: number` - if the value is more than this, it will be set to this value
* `max?: number` - if the value is than this, it's an error `max`
* `min?: number` - if the value is than this, it's an error `min`
* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

### `isObject`, `maybeObject`, `asObject`, `maybeAsObject`

Usage:

```typescript
isObject(contract, options);
maybeObject(contract, options);
asObject(contract, options); // will parse string JSON as object
maybeAsObject(contract, options); // will parse string JSON as object
// where `contract` is Record<string, ValueProcessor>
```

Options:

* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

Example:

```typescript
interface Sample {
  myString: string;
  maybeString: string | undefined;
  numericString: string;
}

const check = isObject<Sample>({
  maybeString: maybeString(), // if these don't match the interface TypeScript will error
  myString: isString(),
  numericString: asString(),
});
```

### `isRecord`, `maybeRecord`

Usage:

```typescript
isRecord<V>(check, options);
maybeRecord<V>(check, options);
// where `check` is ValueProcessor<V>, and Record<string, V> is the type to be processed
```

Options:

* `maxKeys?: number` - if the number of keys in the object is more than this, it's an error `max-keys`
* `minKeys?: number` - if the number of keys in the object is more than this, it's an error `max-keys`
* `validator?: (value: Record<string, V>, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

Example:

```typescript
const check = isRecord(isString());
check.process({ foo: 'bar' })
```

### `isString`, `maybeString`, `asString`, `maybeAsString`

Usage:

```typescript
isString(options);
maybeString(options);
asString(options);
maybeAsString(options);
```

Options:

* `limitLength?: number` - if the length of the string is more than this, it will be truncated to this length
* `padStart?: StringPadding` - pad the start of the string up to given value
* `padEnd?: StringPadding` - pad the end of the string up to given value
* `trim?: 'start' | 'end' | 'both' | 'none'` - removes the leading and/or trailing white space and line terminator characters from the string
* `regex?: RegExp` - regular expression that must be matched, or it's an error `regex`
* `maxLength?: number` - if the length of the string is more than this, it's an error `max-length`
* `minLength?: number` - if the length of the string is less than this, it's an error `min-length`
* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

StringPadding:

* `length: number` - will pad up until this length
* `padWith: string` - the value to pad with

Example:

```typescript
const check = isString({
  limitLength: 6,
  padStart: { length: 6, padWith: '-' },
});
```

```typescript
const check = isString({
  maxLength: 10,
  minLength: 8,
  regex: /^[A-Z]+$/
});
```

```typescript
import validator from 'validator';

const check = isString({
  validator: validator: validator.isEmail,
  validatorOptions: { allow_display_name: true }
});
```

### `isTuple`, `maybeTuple`

Usage:

```typescript
isTuple(options);
maybeTuple(options);
```

Options:

* `validator?: (value: T, options?: any) => boolean` - custom validation function; if false is returned it's an error `validator`
* `validatorOptions?: any` - options to pass to the _validator_

Example:

```typescript
type MyTuple = [number, string];
const check = isTuple([
  isNumber({ max: 9, min: 3 }),
  isString({ regex: /^\w+$/ }),
]);
```
