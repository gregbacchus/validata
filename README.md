# Validata

Type safe data validation and sanitization.

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
