# Validata

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
* otherwise it will be sanitized to undefined (or NaN in the case of number)
