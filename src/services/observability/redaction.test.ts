import { describe, expect, it } from '@jest/globals';

import { redactLogValue, sanitizeLogContext } from './redaction';

describe('log redaction', () => {
  it('redacts sensitive keys, email, and long numeric values recursively', () => {
    const redacted = redactLogValue({
      title: 'Private project',
      nested: { note: 'Private note', message: 'person@example.com paid 125000' },
    });

    expect(redacted).toEqual({
      title: '[REDACTED]',
      nested: { note: '[REDACTED]', message: '[REDACTED_EMAIL] paid [REDACTED_NUMBER]' },
    });
  });

  it('keeps only typed crash context fields', () => {
    expect(
      sanitizeLogContext({
        error_code: 'calculation/invalid_input',
        schema_version: 3,
        purchase_price: '100000',
        email: 'person@example.com',
      }),
    ).toEqual({ error_code: 'calculation/invalid_input', schema_version: 3 });
  });
});
