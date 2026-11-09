import { Decimal } from 'decimal.js';

import type { CostItem, CostProject } from '@/domain';

/**
 * How a category describes its energy/fuel consumption in the wizard.
 *
 * The domain engine stores consumption as "units consumed per 100 usage units"
 * (`consumptionPer100Units`). Each profile converts a natural user-facing input
 * into that representation:
 * - `fuel_distance`: liters per 100 km (stored as-is).
 * - `fuel_hourly`: liters per hour, stored as liters per 100 hours (x100).
 * - `electric_power`: device power in watts, stored as kWh per 100 hours (W / 10).
 */
export type EnergyProfile = Readonly<{
  kind: 'fuel_distance' | 'fuel_hourly' | 'electric_power';
  itemKey: 'fuel' | 'electricity';
  unit: 'liter' | 'kwh';
}>;

const fuelDistance: EnergyProfile = { kind: 'fuel_distance', itemKey: 'fuel', unit: 'liter' };
const fuelHourly: EnergyProfile = { kind: 'fuel_hourly', itemKey: 'fuel', unit: 'liter' };
const electricPower: EnergyProfile = {
  kind: 'electric_power',
  itemKey: 'electricity',
  unit: 'kwh',
};

const storageFactor: Record<EnergyProfile['kind'], Decimal.Value> = {
  fuel_distance: 1,
  fuel_hourly: 100,
  electric_power: 0.1,
};

export function getEnergyProfile(
  project: Pick<CostProject, 'category' | 'usageUnit'>,
  costItems: readonly CostItem[] = [],
): EnergyProfile | null {
  const { category, usageUnit } = project;
  if ((category === 'car' || category === 'motorcycle') && usageUnit === 'km') return fuelDistance;
  if (category === 'boat' && usageUnit === 'hour') return fuelHourly;
  if (category === 'electronics' && usageUnit === 'hour') return electricPower;
  // Projects created by earlier app versions may carry an enabled distance-based fuel item
  // in a category that no longer asks for it. Keep it visible so it can still be edited.
  const legacyFuel = costItems.find(
    (item) => item.key === 'fuel' && item.type === 'usage' && item.isEnabled && !item.deletedAt,
  );
  return legacyFuel ? fuelDistance : null;
}

export function consumptionToStored(profile: EnergyProfile, value: number): number {
  return new Decimal(value).times(storageFactor[profile.kind]).toNumber();
}

export function consumptionFromStored(profile: EnergyProfile, stored: number): number {
  return new Decimal(stored).dividedBy(storageFactor[profile.kind]).toNumber();
}
