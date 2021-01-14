import { expectIssue, expectSuccess, expectValue } from './test-helpers';
import { asUrl, isUrl, maybeAsUrl, maybeUrl } from './url';

// cSpell:disable

describe('isUrl', () => {
  it('will handle non-url', () => {
    const fut = isUrl();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectIssue(fut, 'https://google.com', 'incorrect-type');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle urls', () => {
    const fut = isUrl();
    expectSuccess(fut, new URL('https://google.com'));
  });

  it('will check protocol', () => {
    const fut = isUrl({ protocol: 'https' });
    expectSuccess(fut, new URL('https://google.com'));
    expectIssue(fut, new URL('http://google.com'), 'invalid-protocol');
  });

  it('will check custom validator', () => {
    const fut = isUrl({ validator: (value) => value.pathname === '/test' });
    expectSuccess(fut, new URL('https://google.com/test'));
    expectIssue(fut, new URL('https://google.com'), 'validator');
  });
});

describe('maybeUrl', () => {
  it('will handle non-url', () => {
    const fut = maybeUrl();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectIssue(fut, 'https://google.com', 'incorrect-type');
    expectIssue(fut, 0, 'incorrect-type');
    expectIssue(fut, new Date(), 'incorrect-type');
    expectIssue(fut, [], 'incorrect-type');
    expectIssue(fut, {}, 'incorrect-type');
  });

  it('will handle non-url', () => {
    const fut = maybeUrl({ incorrectTypeToUndefined: true });
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('will handle urls', () => {
    const fut = maybeUrl();
    expectSuccess(fut, new URL('https://google.com'));
  });

  it('will check protocol', () => {
    const fut = maybeUrl({ protocol: 'https' });
    expectSuccess(fut, new URL('https://google.com'));
    expectIssue(fut, new URL('http://google.com'), 'invalid-protocol');
  });

  it('will check custom validator', () => {
    const fut = maybeUrl({ validator: (value) => value.pathname === '/test' });
    expectSuccess(fut, new URL('https://google.com/test'));
    expectIssue(fut, new URL('https://google.com'), 'validator');
  });
});

describe('asUrl', () => {
  it('will handle non-url', () => {
    const fut = asUrl();
    expectIssue(fut, null, 'not-defined');
    expectIssue(fut, undefined, 'not-defined');
    expectSuccess(fut, 'https://google.com');
    expectIssue(fut, 'hello world', 'no-conversion');
    expectIssue(fut, 0, 'no-conversion');
    expectIssue(fut, new Date(), 'no-conversion');
    expectIssue(fut, [], 'no-conversion');
    expectIssue(fut, {}, 'no-conversion');
  });

  it('will custom convert urls', () => {
    const fut = asUrl({ converter: (value) => value === 'http://127.0.0.1' ? new URL('http://localhost') : undefined });
    expectValue(fut, 'http://127.0.0.1', new URL('http://localhost'));
    expectIssue(fut, 'hello world', 'no-conversion');
  });

  it('will handle urls', () => {
    const fut = asUrl();
    expectSuccess(fut, new URL('https://google.com'));
  });
});

describe('maybeAsUrl', () => {
  it('will handle non-url', () => {
    const fut = maybeAsUrl();
    expectValue(fut, null, undefined);
    expectValue(fut, undefined, undefined);
    expectValue(fut, 'hello world', undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('will accept non-url as undefined', () => {
    const fut = maybeAsUrl({ incorrectTypeToUndefined: true });
    expectValue(fut, 'hello world', undefined);
    expectValue(fut, 0, undefined);
    expectValue(fut, new Date(), undefined);
    expectValue(fut, [], undefined);
    expectValue(fut, {}, undefined);
  });

  it('will handle urls', () => {
    const fut = maybeAsUrl();
    expectSuccess(fut, new URL('https://google.com'));
  });
});
