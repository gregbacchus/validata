import { IsArray } from '../array';
import { IsNumber } from '../number';
import { IsObject } from '../object';
import { asString, isString, maybeString } from '../string';
import { isIssue } from '../types';

interface Sample {
  myString: string;
  maybeString: string | undefined;
  numericString: string;
}

const sample = IsObject<Sample>({
  contract: {
    maybeString: maybeString(),
    myString: isString(),
    numericString: asString(),
  },
});

console.log(sample.process({
  maybeString: 123,
  myString: '123',
  numericString: 123,
}));

const sample2 = IsArray({
  item: IsNumber({ min: 17 }),
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
