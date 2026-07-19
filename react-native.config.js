const firebaseRequested = process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';
const androidFirebaseConfigured =
  firebaseRequested && Boolean(process.env.FIREBASE_GOOGLE_SERVICES_FILE);
const iosFirebaseConfigured =
  firebaseRequested && Boolean(process.env.FIREBASE_GOOGLE_SERVICE_INFO_FILE);

const optionalFirebaseDependencies = [
  '@react-native-firebase/analytics',
  '@react-native-firebase/app',
  '@react-native-firebase/app-check',
  '@react-native-firebase/auth',
  '@react-native-firebase/crashlytics',
  '@react-native-firebase/firestore',
  '@react-native-firebase/functions',
  '@react-native-firebase/remote-config',
  '@react-native-google-signin/google-signin',
];

module.exports = {
  dependencies: Object.fromEntries(
    optionalFirebaseDependencies.map((dependency) => [
      dependency,
      {
        platforms: {
          android: androidFirebaseConfigured ? undefined : null,
          ios: iosFirebaseConfigured ? undefined : null,
        },
      },
    ]),
  ),
};
