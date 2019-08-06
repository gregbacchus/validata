import { Contract, ContractProperty, isIssue, Issue, IssueResult, Result } from './types';

interface ObjectOptions<T> {
  contract?: Contract<T>;
  validator?: (value: T, options?: any) => boolean;
  validatorOptions?: any;
}

function validate<T>(_value: T, options: ObjectOptions<T> | undefined) {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  // if (options.max !== undefined && value > options.max) {
  //   result.errors.push('max');
  // }
  // if (options.validator !== undefined && !options.validator(value, options.validatorOptions)) {
  //   result.errors.push('validator');
  // }
  return result.issues.length ? result : undefined;
}

function process<T extends object>(contract: Contract<T>, target: T): Result<T> {
  const issues: Issue[] = [];

  (Object.keys(target) as Array<keyof T>).forEach((key) => {
    if (!contract.hasOwnProperty(key)) {
      issues.push(
        Issue.fromChild(key, target[key], 'unexpected-property'),
      );
    }
  });

  const output: T = {} as any;
  const keys = Object.keys(contract) as Array<keyof T>;
  keys.forEach((key) => {
    const check = contract[key];
    const value = target[key];
    const childResult = check.process(value);
    if (isIssue(childResult)) {
      childResult.issues.forEach((issue) => {
        issues.push(issue.nest(key));
      });
      return;
    }
    if (childResult) {
      output[key] = childResult.value;
    } else {
      output[key] = value;
    }
  });
  return issues.length ? { issues } : { value: output };
}

const isObject = <T>() => (fn: (value: T) => Result<T>) => {
  return (value: any) => {
    if (value === undefined || value === null) {
      return { issues: [Issue.from(value, 'not-defined')] };
    }
    if (typeof value !== 'object' || Array.isArray(value) || value instanceof Date) {
      return { issues: [Issue.from(value, 'incorrect-type')] };
    }
    return fn(value);
  };
};

const maybeObject = <T>() => (fn: (value: T) => Result<T | undefined>) => {
  return (value: any) => {
    if (value === undefined || value === null) {
      return { value: undefined };
    }
    if (typeof value !== 'object' || Array.isArray(value) || value instanceof Date) {
      return { value: undefined };
    }
    return fn(value);
  };
};

const children = <T>(options?: ObjectOptions<T>) => (fn: (value: T) => Result<T>) => {
  return (value: any) => {
    if (!options) return fn(value);

    let coerced = value;
    if (options.contract) {
      const result = process(options.contract, coerced);
      if (isIssue(result)) {
        return result;
      }
      if (result) {
        coerced = result.value;
      }
    }
    return fn(coerced);
  };
};

export function IsObject<T extends object>(options?: ObjectOptions<T>): ContractProperty<T> {
  return {
    process: isObject<T>()(children(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    })),
  };
}

export function MaybeObject<T extends object>(options?: ObjectOptions<T>): ContractProperty<T | undefined> {
  return {
    process: maybeObject<T>()(children(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    })),
  };
}
