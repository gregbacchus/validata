import { isString } from './string';
import { StringFormat } from './string-format';
import { expectSuccess } from './test-helpers';
import { isIssue, ValueProcessor } from './types';

// cSpell:disable

export const expectFormatIssue = <T>(fut: ValueProcessor<T>, value: unknown, expectedFormat: string): void => {
  const result = fut.process(value);
  if (!isIssue(result)) {
    // eslint-disable-next-line no-undef
    fail('no issue');
  }
  expect(result.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        info: expect.objectContaining({
          expectedFormat,
        }),
        reason: 'format',
      }),
    ]),
  );
};

describe('StringFormat', () => {
  describe('ULID', () => {
    const fut = isString({ format: StringFormat.ULID() });

    it('have issues with invalid ULIDs', () => {
      expectFormatIssue(fut, '', 'ulid');
      expectFormatIssue(fut, 'test', 'ulid');
      expectFormatIssue(fut, 'test01EFNX7ZQ36RXJV136T0SP4Y77', 'ulid');
      expectFormatIssue(fut, '01EFNX7ZQ36RXJV136T0SP4Y77test', 'ulid');
      expectFormatIssue(fut, '{01EFNX7ZQ36RXJV136T0SP4Y77}', 'ulid');
      expectFormatIssue(fut, '01EFNX7Z-Q36R-XJV1-36T0-SP4Y77', 'ulid');
      expectFormatIssue(fut, 'a4beb195-6171-4542-9cc2-1c75f5688095', 'ulid');
    });

    it('accept ULIDs', () => {
      expectSuccess(fut, '01EFNX7ZQ36RXJV136T0SP4Y77');
      expectSuccess(fut, '01EFNX7SQ8A5YPF2YJDVJTY1H5');
    });
  });

  describe('UUID', () => {
    const fut = isString({ format: StringFormat.UUID() });

    it('have issues with invalid UUIDs', () => {
      expectFormatIssue(fut, '', 'uuid');
      expectFormatIssue(fut, 'test', 'uuid');
      expectFormatIssue(fut, 'testa4beb195-6171-4542-9cc2-1c75f5688095', 'uuid');
      expectFormatIssue(fut, 'a4beb195-6171-4542-9cc2-1c75f5688095test', 'uuid');
      expectFormatIssue(fut, '{a4beb195-6171-4542-9cc2-1c75f5688095}', 'uuid');
    });

    it('accept UUIDs', () => {
      expectSuccess(fut, 'b8493e8b-fdf8-4420-ab63-0701a6850da6');
      expectSuccess(fut, '52491B51-E733-43A2-BCDE-1CCE35EE82A6');
    });
  });
});
