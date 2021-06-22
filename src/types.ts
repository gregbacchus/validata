export type Contract<T> = {
  [P in keyof T]-?: ValueProcessor<T[P]>;
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
  public static from = (value: unknown, reason: string, info?: Record<string, unknown>): Issue => {
    return new Issue([], value, reason, info);
  }

  public static fromChild = (path: Path | Path[], value: unknown, reason: string, info?: Record<string, unknown>): Issue => {
    return new Issue(Array.isArray(path) ? path : [path], value, reason, info);
  }

  private constructor(
    public readonly path: Path[],
    public readonly value: unknown,
    public readonly reason: string,
    public readonly info?: Record<string, unknown>,
  ) { }

  /**
   * ARROW FUNCTION
   */
  public nest = (parent: Path): Issue => {
    return new Issue(
      [parent, ...this.path],
      this.value,
      this.reason,
      this.info,
    );
  }

  /**
   * ARROW FUNCTION
   */
  public nestSwap = (parent: Path): Issue => {
    return new Issue(
      [parent, ...this.path.slice(1)],
      this.value,
      this.reason,
      this.info,
    );
  }
}

export interface IssueResult {
  issues: Issue[];
}

export interface ValueProcessor<T> {
  process(value: unknown): Result<T>;
}

export type Next<T, R> = (value: T) => Result<R>;

export interface NotPrimitive { [key: string]: any; }

export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;

export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type OptionalProperties<T extends NotPrimitive> = Pick<T, OptionalKeys<T>>;

export type RequiredProperties<T extends NotPrimitive> = Omit<T, OptionalKeys<T>>;

export type AllProperties<T extends NotPrimitive> = RequiredProperties<T> & Partial<OptionalProperties<T>>;

export type TypeOf<T extends ValueProcessor<V> | Contract<V>, V = unknown> =
  T extends ValueProcessor<infer Type> ? AllProperties<Type> : { [K in keyof T]: T[K] extends ValueProcessor<infer Type> ? AllProperties<Type> : never };
