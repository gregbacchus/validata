import { isArray } from '../array';
import { asBoolean, isBoolean } from '../boolean';
import { asNumber, isNumber } from '../number';
import { isObject } from '../object';
import { isRecord } from '../record';
import { asString, isString, maybeString } from '../string';
import { isTuple } from '../tuple';
import { isIssue } from '../types';
import { nullOr } from './../common';

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

console.log(JSON.stringify(sample.process({
  maybeString: 123,
  myString: 123,
  numericString: 123,
})));

console.log(JSON.stringify(sample.process({
  myString: '123',
  numericString: 123,
})));

const sample2 = isArray(isNumber({ min: 17 }), {
  minLength: 1,
});

console.log(JSON.stringify(sample2.process([])));
console.log(JSON.stringify(sample2.process([1])));
console.log(sample2.process([102, 123]));
console.log(JSON.stringify(sample2.process([new Date()])));

const result = sample2.process([new Date()]);
if (isIssue(result)) {
  console.log('Issues', result.issues);
} else {
  console.log('Accepted value', result.value);
}

const sample3 = isBoolean();
const sample31 = asBoolean();

console.log(JSON.stringify(sample3.process(true)));
console.log(JSON.stringify(sample31.process('true')));

const sample4 = isTuple([
  isNumber(),
  asString(),
]);

console.log(JSON.stringify(sample4.process(['foo', 'bar'])));
console.log(sample4.process([102, '123']));
console.log(sample4.process([102, 123])); // same as above because of asString
console.log(JSON.stringify(sample4.process([345])));
console.log(JSON.stringify(sample4.process([1, 2, 3])));

const sample5 = isRecord(asNumber());

console.log(JSON.stringify(sample5.process({ foo: 'bar' })));
console.log(sample5.process({ foo: '123' }));
console.log(sample5.process({ foo: 123 })); // same as above because of asNumber

const sample6 = nullOr(isString)();

console.log(sample6.process(null));
console.log(sample6.process('asd'));
