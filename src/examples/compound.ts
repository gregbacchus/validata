import { Contract, isObject, isString, maybeString } from '..';

interface Base {
  nonOptional: string;
  optional?: string;
}

interface Compound {
  base: Base;
}

const base: Contract<Base> = {
  nonOptional: isString(),
  optional: maybeString(),
};

const compound: Contract<Compound> = {
  base: isObject(base),
};

console.log(compound);
