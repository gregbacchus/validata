# Validata

Type safe data validation and sanitization.

## Getting started

```bash
npm i validata
```

## Basic usage

```typescript
import { AsString, IsObject, IsString, MaybeString } from 'validata';

interface Sample {
  maybeString: string | undefined;
  myString: string;
  numericString: string;
}

const sample = IsObject<Sample>({
  contract: {
    maybeString: MaybeString(), // will allow string data type or sanitize to undefined
    myString: IsString(), // will allow only string data type
    numericString: AsString(), // will allow string or attempt to convert to string
  },
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

## Naming conventions

### `Is...` e.g. `IsNumber`

* if the value is of the type it will be accepted
* `null` or `undefined` cause an issue
* otherwise it will cause an issue

### `Maybe...` e.g. `MaybeNumber`

* if the value is of the type it will be accepted
* otherwise it will be sanitized to undefined

### `As...` e.g. `AsNumber`

* if the value is of the type it will be accepted
* if the value can be converted to the type, it will be converted and used
* if the value is cannot be converted or is `null` or `undefined`, the default will be used if provided
* otherwise it will cause an issue

### `MaybeAs...` e.g. `MaybeAsNumber`

* if the value is of the type it will be accepted
* if the value can be converted to the type, it will ne converted
* if the value is cannot be converted or is `null` or `undefined`, the default will be used if provided
* otherwise it will be sanitized to undefined
