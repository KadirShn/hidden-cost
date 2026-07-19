import { describe, expect, it, jest } from '@jest/globals';

const localOnlyRuntimeConfig = Object.freeze({
  appEnvironment: 'preview',
  firebase: Object.freeze({ enabled: false }),
  observability: Object.freeze({
    analyticsEnabled: false,
    appCheckEnabled: false,
    crashlyticsEnabled: false,
  }),
});

function failIfLoaded(moduleName: string) {
  return () => {
    throw new Error(`${moduleName} must not load in local-only mode`);
  };
}

describe('local-only native observability guards', () => {
  it('does not load Firebase App or App Check', async () => {
    jest.resetModules();
    jest.doMock('@/config/runtime-config', () => ({ runtimeConfig: localOnlyRuntimeConfig }));
    jest.doMock('@react-native-firebase/app', failIfLoaded('Firebase App'));
    jest.doMock('@react-native-firebase/app-check', failIfLoaded('Firebase App Check'));

    let initializeAppProtection: typeof import('./app-protection.native').initializeAppProtection;
    jest.isolateModules(() => {
      ({ initializeAppProtection } = jest.requireActual('./app-protection.native'));
    });

    await expect(initializeAppProtection!()).resolves.toBe('disabled');
  });

  it('does not load Firebase Analytics', async () => {
    jest.resetModules();
    jest.doMock('@/config/runtime-config', () => ({ runtimeConfig: localOnlyRuntimeConfig }));
    jest.doMock('@react-native-firebase/analytics', failIfLoaded('Firebase Analytics'));
    jest.doMock('@/services/firebase/firebase-client', failIfLoaded('Firebase client'));

    let analyticsAdapter: typeof import('./analytics-adapter.native').analyticsAdapter;
    jest.isolateModules(() => {
      ({ analyticsAdapter } = jest.requireActual('./analytics-adapter.native'));
    });

    await expect(analyticsAdapter!.setCollectionEnabled(true)).resolves.toBeUndefined();
    await expect(analyticsAdapter!.track('app_opened', {})).resolves.toBeUndefined();
  });

  it('does not load Firebase Crashlytics', async () => {
    jest.resetModules();
    jest.doMock('@/config/runtime-config', () => ({ runtimeConfig: localOnlyRuntimeConfig }));
    jest.doMock('@react-native-firebase/crashlytics', failIfLoaded('Firebase Crashlytics'));
    jest.doMock('@/services/firebase/firebase-client', failIfLoaded('Firebase client'));

    let crashReporter: typeof import('./crash-reporter.native').crashReporter;
    jest.isolateModules(() => {
      ({ crashReporter } = jest.requireActual('./crash-reporter.native'));
    });

    await expect(crashReporter!.initialize()).resolves.toBeUndefined();
  });
});
