import { use } from 'react';

import { AdsContext } from './ads-context';

export function useAds() {
  return use(AdsContext);
}
