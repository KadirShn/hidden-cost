import { describe, expect, it } from '@jest/globals';

import { ANALYTICS_EVENTS } from './analytics-contracts';
import { sanitizeAnalyticsParams } from './analytics-sanitizer';

describe('analytics event contract', () => {
  it('matches the Product Spec event list exactly', () => {
    expect(ANALYTICS_EVENTS).toEqual([
      'app_opened',
      'onboarding_started',
      'onboarding_completed',
      'template_viewed',
      'calculation_started',
      'calculation_step_viewed',
      'calculation_step_completed',
      'calculation_abandoned',
      'calculation_completed',
      'project_saved',
      'project_duplicated',
      'project_deleted',
      'comparison_started',
      'comparison_completed',
      'pdf_export_started',
      'pdf_export_completed',
      'share_completed',
      'cloud_backup_enabled',
      'sign_in_started',
      'sign_in_completed',
      'sync_failed',
      'consent_status_updated',
      'account_deletion_started',
      'account_deletion_completed',
    ]);
  });
});

describe('sanitizeAnalyticsParams', () => {
  it('keeps only the Product Spec categorical allowlist', () => {
    expect(
      sanitizeAnalyticsParams({
        step_name: 'step_2',
        project_count_bucket: '2-3',
        ownership_month_bucket: '25-60',
        locale: 'tr',
        is_offline: true,
        source_screen: 'wizard',
      }),
    ).toEqual({
      step_name: 'step_2',
      project_count_bucket: '2-3',
      ownership_month_bucket: '25-60',
      locale: 'tr',
      is_offline: true,
      source_screen: 'wizard',
    });
  });

  it('drops amounts, title, note, email, and free text', () => {
    const result = sanitizeAnalyticsParams({
      purchase_price: 125000,
      financed_amount: 100000,
      title: 'My motorcycle',
      note: 'private note',
      email: 'person@example.com',
      free_text: 'user supplied content',
      source_screen: 'person@example.com',
      step_name: 'contains spaces and arbitrary words',
    });

    expect(result).toEqual({});
    expect(JSON.stringify(result)).not.toContain('125000');
    expect(JSON.stringify(result)).not.toContain('example.com');
    expect(JSON.stringify(result)).not.toContain('motorcycle');
  });
});
