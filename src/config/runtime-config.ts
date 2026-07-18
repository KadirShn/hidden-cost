import { resolveAppEnvironment } from '@/config/app-environment';

export type RuntimeConfig = Readonly<{
  appEnvironment: ReturnType<typeof resolveAppEnvironment>;
}>;

export const runtimeConfig: RuntimeConfig = Object.freeze({
  appEnvironment: resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV),
});
