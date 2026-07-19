const SENSITIVE_KEY =
  /(amount|cost|price|principal|title|note|email|name|text|token|secret|password|currency)/i;
const EMAIL = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
const LONG_NUMBER = /\b\d{4,}\b/g;

export type SafeLogContext = Readonly<{
  error_code?: string;
  schema_version?: number;
  category?: string;
  app_version?: string;
  operation?: string;
}>;

export function redactLogValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(EMAIL, '[REDACTED_EMAIL]').replace(LONG_NUMBER, '[REDACTED_NUMBER]');
  }
  if (Array.isArray(value)) return value.map(redactLogValue);
  if (typeof value === 'object' && value) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactLogValue(item),
      ]),
    );
  }
  return value;
}

export function sanitizeLogContext(input: Record<string, unknown>): SafeLogContext {
  const allowed = ['error_code', 'schema_version', 'category', 'app_version', 'operation'];
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => allowed.includes(key))
      .map(([key, value]) => [key, redactLogValue(value)]),
  ) as SafeLogContext;
}
