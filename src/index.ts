import { IsObject } from './object';
import { AsString, IsString, MaybeString } from './string';

interface Sample {
  myString: string;
  maybeString: string | undefined;
  numericString: string;
}

const sample = IsObject<Sample>({
  contract: {
    maybeString: MaybeString(),
    myString: IsString(),
    numericString: AsString(),
  },
});

console.log(sample.process({
  maybeString: 123,
  myString: '123',
  numericString: 123,
}));
