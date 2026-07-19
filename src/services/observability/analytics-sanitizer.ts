import type { SafeAnalyticsParams } from './analytics-contracts';

const ALLOWED_KEYS = new Set<keyof SafeAnalyticsParams>([
  'step_name',
  'project_count_bucket',
  'ownership_month_bucket',
  'locale',
  'is_offline',
  'source_screen',
]);
const SAFE_SLUG = /^[a-z0-9_]{1,40}$/;
const PROJECT_BUCKETS = new Set(['0', '1', '2-3', '4-10', '11+']);
const OWNERSHIP_BUCKETS = new Set(['1-6', '7-12', '13-24', '25-60', '61+']);

export function sanitizeAnalyticsParams(input: Record<string, unknown>): SafeAnalyticsParams {
  const output: Record<string, string | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_KEYS.has(key as keyof SafeAnalyticsParams)) continue;
    if (key === 'is_offline' && typeof value === 'boolean') output[key] = value;
    if (key === 'locale' && (value === 'tr' || value === 'en')) output[key] = value;
    if (key === 'project_count_bucket' && PROJECT_BUCKETS.has(String(value))) {
      output[key] = String(value);
    }
    if (key === 'ownership_month_bucket' && OWNERSHIP_BUCKETS.has(String(value))) {
      output[key] = String(value);
    }
    if ((key === 'step_name' || key === 'source_screen') && SAFE_SLUG.test(String(value))) {
      output[key] = String(value);
    }
  }
  return output as SafeAnalyticsParams;
}
