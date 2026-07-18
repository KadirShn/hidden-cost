import { Redirect, type Href } from 'expo-router';

import { useSettings } from '@/features/settings/use-settings';

export default function IndexRoute() {
  const { onboardingCompleted } = useSettings();
  const destination = (onboardingCompleted ? '/home' : '/welcome') as Href;

  return <Redirect href={destination} />;
}
