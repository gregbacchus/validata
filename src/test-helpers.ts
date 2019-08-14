import { ContractProperty, isIssue, Path } from './types';

export interface TestIssue {
  path?: Path[];
  reason: string;
}

export interface TestDefinition<T> {
  input: any;
  expect?: T;
  issues?: TestIssue[];
}

export function runTests<T>(fut: ContractProperty<T>, ...tests: Array<TestDefinition<T>>) {
  tests.forEach((test) => {
    const result = fut.process(test.input);
    if (test.issues) {
      expect(result).toBeDefined();
      expect(isIssue(result)).toBeTruthy();
      if (result && isIssue(result)) {
        test.issues.forEach((issue) => {
          expect(result.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: issue.path || [],
                reason: issue.reason,
              }),
            ]),
          );
        });
      }
    } else {
      expect(result).toBeDefined();
      expect(isIssue(result)).toBeFalsy();
      if (result && !isIssue(result)) {
        expect(result.value).toEqual(test.expect);
      }
    }
  });
}

export function expectIssue<T>(fut: ContractProperty<T>, value: any, reason: string, path: Path[] = []) {
  const result = fut.process(value);
  if (!isIssue(result)) {
    fail('no issue');
    return;
  }
  expect(result.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path,
        reason,
      }),
    ]),
  );
}

export function expectSuccess<T>(fut: ContractProperty<T>, value: any) {
  const result = fut.process(value);
  expect(result).toBeDefined();
  expect(isIssue(result)).toBeFalsy();
}

export function expectValue<T>(fut: ContractProperty<T>, value: any, coerced: T) {
  const result = fut.process(value);
  expect(result).toBeDefined();
  expect(isIssue(result)).toBeFalsy();
  if (result && !isIssue(result)) {
    expect(result.value).toEqual(coerced);
  }
}
