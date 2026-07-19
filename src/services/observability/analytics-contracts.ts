export const ANALYTICS_EVENTS = [
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
  'ad_native_impression',
  'ad_interstitial_shown',
  'ad_rewarded_started',
  'ad_rewarded_completed',
  'consent_status_updated',
  'account_deletion_started',
  'account_deletion_completed',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
export type ProjectCountBucket = '0' | '1' | '2-3' | '4-10' | '11+';
export type OwnershipMonthBucket = '1-6' | '7-12' | '13-24' | '25-60' | '61+';

export type SafeAnalyticsParams = Readonly<{
  step_name?: string;
  project_count_bucket?: ProjectCountBucket;
  ownership_month_bucket?: OwnershipMonthBucket;
  locale?: 'tr' | 'en';
  is_offline?: boolean;
  source_screen?: string;
}>;

export type AnalyticsEventMap = {
  [Name in AnalyticsEventName]: SafeAnalyticsParams;
};

export interface AnalyticsAdapter {
  setCollectionEnabled(enabled: boolean): Promise<void>;
  track(name: AnalyticsEventName, params: SafeAnalyticsParams): Promise<void>;
}

export function projectCountBucket(count: number): ProjectCountBucket {
  if (count <= 0) return '0';
  if (count === 1) return '1';
  if (count <= 3) return '2-3';
  if (count <= 10) return '4-10';
  return '11+';
}

export function ownershipMonthBucket(months: number): OwnershipMonthBucket {
  if (months <= 6) return '1-6';
  if (months <= 12) return '7-12';
  if (months <= 24) return '13-24';
  if (months <= 60) return '25-60';
  return '61+';
}
