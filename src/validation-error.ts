import { Issue } from './types';

export class ValidationError extends Error {
  constructor(public readonly issues: Issue[]) {
    super('Validation failed');

    this.name = 'ValidationError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
