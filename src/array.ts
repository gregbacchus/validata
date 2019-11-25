import { ContractProperty, exists as defined, isIssue, Issue, IssueResult, isValue, Result } from './types';

interface ArrayOptions<T> {
  maxLength?: number;
  minLength?: number;
  item: ContractProperty<T>;
}

function validate<T>(value: T[], options: ArrayOptions<T> | undefined) {
  if (!options) return undefined;

  const result: IssueResult = { issues: [] };
  // check length
  if (options.minLength !== undefined && value.length < options.minLength) {
    result.issues.push(Issue.from(value, 'min-length'));
  }
  if (options.maxLength !== undefined && value.length > options.maxLength) {
    result.issues.push(Issue.from(value, 'max-length'));
  }
  // // check items
  // value.forEach((item, index) => {
  //   if (options.item !== undefined) {
  //     const itemResult = options.item.process(item);
  //     if (isIssue(itemResult)) {
  //       itemResult.issues.forEach((issue) => {
  //         result.issues.push(issue.nest(index));
  //       });
  //     }
  //   }
  // });
  return result.issues.length ? result : undefined;
}

const isArray = <T>() => (fn: (value: T[]) => Result<T[]>) => {
  return (value: any) => {
    if (value === undefined || value === null) {
      return { issues: [Issue.from(value, 'not-defined')] };
    }
    if (!Array.isArray(value)) {
      return { issues: [Issue.from(value, 'incorrect-type')] };
    }
    return fn(value);
  };
};

const maybeArray = <T>() => (fn: (value: T[]) => Result<T[] | undefined>) => {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return { value: undefined };
    }
    if (!Array.isArray(value)) {
      return { value: undefined };
    }
    return fn(value);
  };
};

const children = <T>(options?: ArrayOptions<T>) =>
  (fn: (value: T[]) => Result<T[]>) =>
    (value: T[]): Result<T[]> => {
      if (!options) return fn(value);

      // check items
      const results = value.map((item, index) =>
        ({
          index,
          originalValue: item,
          processed: options.item !== undefined
            ? options.item.process(item)
            : undefined,
        }),
      );
      const issueResults = results.map((item) =>
        isIssue(item.processed)
          ? { index: item.index, issue: item.processed }
          : undefined,
      ).filter(defined);

      // there were issues, return them
      if (issueResults.length) {
        const issues = issueResults.reduce((acc, item) => [
          ...acc,
          ...item.issue.issues.map((issue) => issue.nest(item.index)),
        ], [] as Issue[]);
        return { issues };
      }

      // all good
      return fn(results.map((item) => isValue(item.processed) ? item.processed.value : item.originalValue));
    };

export function IsArray<T>(options?: ArrayOptions<T>): ContractProperty<T[]> {
  return {
    process: isArray<T>()(children(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    })),
  };
}

export function MaybeArray<T>(options?: ArrayOptions<T>): ContractProperty<T[] | undefined> {
  return {
    process: maybeArray<T>()(children(options)((value) => {
      const result = validate(value, options);
      return result || { value };
    })),
  };
}
