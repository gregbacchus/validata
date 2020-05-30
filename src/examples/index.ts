import { isArray } from '../array';
import { asNumber, isNumber } from '../number';
import { isObject } from '../object';
import { isRecord } from '../record';
import { asString, isString, maybeString } from '../string';
import { isTuple } from '../tuple';
import { isIssue } from '../types';

interface Sample {
  myString: string;
  maybeString: string | undefined;
  numericString: string;
}

const sample = isObject<Sample>({
  maybeString: maybeString(),
  myString: isString(),
  numericString: asString(),
});

console.log(sample.process({
  maybeString: 123,
  myString: '123',
  numericString: 123,
}));

const sample2 = isArray(isNumber({ min: 17 }), {
  minLength: 1,
});

console.log(sample2.process([]));
console.log(JSON.stringify(sample2.process([1])));
console.log(sample2.process([102, 123]));
console.log(sample2.process([new Date()]));

const result = sample2.process([new Date()]);
if (isIssue(result)) {
  console.log('Issues', result.issues);
} else {
  console.log('Accepted value', result.value);
}

const sample3 = isTuple([
  isNumber(),
  asString(),
]);

console.log(JSON.stringify(sample3.process(['foo', 'bar'])));
console.log(sample3.process([102, '123']));
console.log(sample3.process([102, 123])); // same as above because of asString
console.log(JSON.stringify(sample3.process([345])));
console.log(JSON.stringify(sample3.process([1, 2, 3])));

const sample4 = isRecord(asNumber());

console.log(JSON.stringify(sample4.process({ foo: 'bar' })));
console.log(sample4.process({ foo: '123' }));
console.log(sample4.process({ foo: 123 })); // same as above because of asNumber
