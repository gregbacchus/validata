import { asArray } from './array';
import { asEnum, isEnum, maybeAsEnum, maybeEnum } from './enum';
import { isObject } from './object';
import { isIssue, IssueResult } from './types';

enum MyEnum {
  WATER,
  GAS,
  ELECTRIC,
}

enum EnumWithStrings {
  KEY_1 = 'VALUE_1',
  KEY_2 = 'VALUE_2',
}

describe('isEnum', () => {
  it('will accept correct value from enum', () => {
    const test = isEnum(MyEnum).process(MyEnum.WATER);
    expect(test).toEqual({ value: MyEnum.WATER });
  });

  it('incorrect string value provided for a number enum', () => {
    const test = isEnum(MyEnum).process(EnumWithStrings.KEY_1);
    expect((test as IssueResult).issues[0].reason).toBe('key-not-found');
  });

  it('incorrect type provided', () => {
    const test = isEnum(MyEnum).process(true);
    expect((test as IssueResult).issues[0].reason).toBe('incorrect-type');
  });

  it('will not recognize the key of an enum as a valid input', () => {
    const test = isEnum(MyEnum).process('WATER');
    expect((test as IssueResult).issues[0].reason).toBe('key-not-found');
  });
});

describe('maybeEnum', () => {
  it('will accept correct value from enum', () => {
    const test = maybeEnum(MyEnum).process(MyEnum.WATER);
    expect(test).toEqual({ value: MyEnum.WATER });
  });

  it('incorrect string value provided for a number enum', () => {
    const test = maybeEnum(MyEnum).process(EnumWithStrings.KEY_1);
    expect((test as IssueResult).issues[0].reason).toBe('key-not-found');
  });

  it('incorrect type provided', () => {
    const test = maybeEnum(MyEnum).process(true);
    expect((test as IssueResult).issues[0].reason).toBe('incorrect-type');
  });

  it('will not recognize the key of an enum as a valid input', () => {
    const test = maybeEnum(MyEnum).process('WATER');
    expect((test as IssueResult).issues[0].reason).toBe('key-not-found');
  });

  it('will accept null or undefined value', () => {
    const fut = maybeEnum(MyEnum);
    const nullTest = fut.process(null);
    expect(nullTest).toEqual({ value: undefined });
    const undefinedTest = fut.process(undefined);
    expect(undefinedTest).toEqual({ value: undefined });
  });
});

describe('asEnum', () => {
  it('will accept correct value from enum', () => {
    const test = asEnum(MyEnum).process(MyEnum.WATER);
    expect(test).toEqual({ value: MyEnum.WATER });
  });

  it('incorrect string value provided for a number enum', () => {
    const test = asEnum(MyEnum).process(EnumWithStrings.KEY_1);
    expect((test as IssueResult).issues[0].reason).toBe('no-conversion');
  });

  it('incorrect type provided', () => {
    const test = asEnum(MyEnum).process(true);
    expect((test as IssueResult).issues[0].reason).toBe('no-conversion');
  });

  it('will recognize the key of an enum as a valid input', () => {
    const test = asEnum(MyEnum).process('WATER');
    expect(test).toEqual({ value: MyEnum.WATER });
  });
});

describe('maybeAsEnum', () => {
  it('will accept correct value from enum', () => {
    const test = maybeAsEnum(MyEnum).process(MyEnum.WATER);
    expect(test).toEqual({ value: MyEnum.WATER });
  });

  it('incorrect string value provided for a number enum', () => {
    const test = maybeAsEnum(MyEnum).process(EnumWithStrings.KEY_1);
    expect((test as IssueResult).issues[0].reason).toBe('no-conversion');
  });

  it('incorrect type provided', () => {
    const test = maybeAsEnum(MyEnum).process(true);
    expect((test as IssueResult).issues[0].reason).toBe('no-conversion');
  });

  it('will recognize the key of an enum as a valid input', () => {
    const test = maybeAsEnum(MyEnum).process('WATER');
    expect(test).toEqual({ value: MyEnum.WATER });
  });

  it('will accept null or undefined value', () => {
    const fut = maybeAsEnum(MyEnum);
    const nullTest = fut.process(null);
    expect(nullTest).toEqual({ value: undefined });
    const undefinedTest = fut.process(undefined);
    expect(undefinedTest).toEqual({ value: undefined });
  });
});

describe('enums with isObject', () => {
  enum Sauce {
    MARINARA,
    BBQ,
    ALFREDO,
  }
  enum Topping {
    CHEESE,
    PEPPERONI,
    HAM,
    BACON,
    OLIVES,
    ONIONS,
  }
  interface Pizza {
    sauce: Sauce,
    toppings: Topping[];
  }

  const pizzaCheck = isObject<Pizza>({
    sauce: asEnum(Sauce),
    toppings: asArray(asEnum(Topping)),
  });

  it('will do something', () => {
    const test = pizzaCheck.process({ sauce: 'MARINARA', toppings: ['CHEESE', 'PEPPERONI'] });
    if (isIssue(test)) {
      expect(false);
      return;
    }
    expect(test.value).toEqual({ sauce: Sauce.MARINARA, toppings: [Topping.CHEESE, Topping.PEPPERONI] });
  });
});

describe('', () => {
  enum Topping {
    CHEESE,
    PEPPERONI,
    HAM,
    BACON,
    OLIVES,
    ONIONS,
  }

  it('can optionally show valid keys', () => {
    let test = isEnum(Topping).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({});

    test = isEnum(Topping, { showValidKeys: true }).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({ validKeys: [0, 1, 2, 3, 4, 5] });
  });

  it('can optionally show valid values', () => {
    let test = isEnum(Topping).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({});

    test = isEnum(Topping, { showValidValues: true }).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({
      validValues: [
        'CHEESE',
        'PEPPERONI',
        'HAM',
        'BACON',
        'OLIVES',
        'ONIONS',
      ],
    });
  });

  it('can optionally show valid keys and values together', () => {
    let test = isEnum(Topping).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({});

    test = isEnum(Topping, { showValidKeys: true, showValidValues: true }).process('TESTING');
    expect((test as IssueResult).issues.length).toBe(1);
    expect((test as IssueResult).issues[0].info).toEqual({
      validKeys: [0, 1, 2, 3, 4, 5],
      validValues: [
        'CHEESE',
        'PEPPERONI',
        'HAM',
        'BACON',
        'OLIVES',
        'ONIONS',
      ],
    });
  });
});
