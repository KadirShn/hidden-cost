import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from '@jest/globals';

const nativeAdapters = [
  'analytics-adapter.native.ts',
  'app-protection.native.ts',
  'crash-reporter.native.ts',
];

describe('native observability module loading', () => {
  it.each(nativeAdapters)(
    'does not create an asynchronously evaluated Metro chunk for %s',
    (file) => {
      const source = readFileSync(path.join(__dirname, file), 'utf8');
      const runtimeSource = source.replace(/typeof\s+import\([^)]*\)/gu, '');

      expect(runtimeSource).not.toMatch(/\bimport\s*\(/u);
    },
  );
});
