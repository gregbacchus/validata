import { isIssue, Path, ValueProcessor } from './types';

export interface TestIssue {
  path?: Path[];
  reason: string;
}

export interface TestDefinition<T> {
  input: unknown;
  expect?: T;
  issues?: TestIssue[];
}

export const runTests = <T>(fut: ValueProcessor<T>, ...tests: Array<TestDefinition<T>>): void => {
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
};

export const expectIssue = <T>(fut: ValueProcessor<T>, value: unknown, reason: string, path: Path[] = []): void => {
  const result = fut.process(value);
  if (!isIssue(result)) {
    fail('no issue');
  }
  expect(result.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path,
        reason,
      }),
    ]),
  );
};

export const expectSuccess = <T>(fut: ValueProcessor<T>, value: unknown): void => {
  const result = fut.process(value);
  expect(result).toBeDefined();
  if (isIssue(result)) {
    fail(`Unexpected issue: ${JSON.stringify(result)}`);
  }
};

export const expectValue = <T>(fut: ValueProcessor<T>, value: unknown, coerced: T): void => {
  const result = fut.process(value);
  expect(result).toBeDefined();
  if (isIssue(result)) {
    fail(`Unexpected issue: ${JSON.stringify(result)}`);
  }
  if (result) {
    expect(result.value).toEqual(coerced);
  }
};
