export type Contract<T> = {
  [P in keyof T]: ValueProcessor<T[P]>;
};

export type Result<T> = ValueResult<T> | IssueResult;

export interface ValueResult<T> {
  value: T;
}

export const isValue = <T>(result: Result<T> | undefined): result is ValueResult<T> => {
  return !!result && ('value' in result);
};

export const isIssue = <T>(result: Result<T> | undefined): result is IssueResult => {
  return !!result && (result as IssueResult).issues !== undefined;
};

export const exists = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

export type Path = string | number | symbol;

export class Issue {
  static from(value: any, reason: string): Issue {
    return new Issue([], value, reason);
  }

  static fromChild(path: Path, value: any, reason: string): Issue {
    return new Issue([path], value, reason);
  }

  private constructor(
    readonly path: Path[],
    readonly value: any,
    readonly reason: string,
  ) { }

  nest(parent: Path): Issue {
    return new Issue(
      [parent, ...this.path],
      this.value,
      this.reason,
    );
  }
}

export interface IssueResult {
  issues: Issue[];
}

export interface ValueProcessor<T> {
  process(value: any): Result<T>;
}

export type Next<T, R> = (value: T) => Result<R>;

export type UndefinedHandler<T, O> = (options?: O) => () => Result<T> | undefined;
export type Definitely<T, O> = (options?: O, undefinedHandler?: () => Result<T> | undefined) => (next: Next<unknown, T>) => (value: unknown) => Result<T>;
export type Maybe<T, O> = (options?: O, undefinedHandler?: () => Result<T> | undefined) => (next: Next<unknown, T>) => (value: unknown) => Result<T | undefined>;
export type Is<T, O> = (options?: O) => (next: Next<T, T>) => (value: unknown) => Result<T>;
export type As<T, O> = (options?: O) => (next: Next<T, T>) => (value: unknown) => Result<T>;
export type Coerce<T, O> = (options?: O) => (next: Next<T, T>) => (value: T) => Result<T>;
