export function resolveAdUnitId(input: {
  testMode: boolean;
  testId: string;
  productionId?: string;
}): string | undefined {
  return input.testMode ? input.testId : input.productionId;
}
