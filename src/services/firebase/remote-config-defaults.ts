export const REMOTE_CONFIG_DEFAULTS = Object.freeze({
  ads_enabled: false,
  native_ads_enabled: false,
  interstitial_ads_enabled: false,
  rewarded_export_enabled: false,
  interstitial_min_completed_calculations: 3,
  interstitial_cooldown_minutes: 30,
  max_compare_items: 3,
  cloud_backup_enabled: true,
  template_catalog_version: 1,
  maintenance_mode: false,
  minimum_supported_version: '1.0.0',
  force_update_enabled: false,
});

type WidenRemoteValue<T> = T extends boolean ? boolean : T extends number ? number : string;

export type RemoteConfigValues = {
  readonly [Key in keyof typeof REMOTE_CONFIG_DEFAULTS]: WidenRemoteValue<
    (typeof REMOTE_CONFIG_DEFAULTS)[Key]
  >;
};
