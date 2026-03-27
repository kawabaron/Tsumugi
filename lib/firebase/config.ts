const readEnv = (key: string) => process.env[key]?.trim() ?? "";

export const getFirebaseConfig = () => ({
  apiKey: readEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
});

export const isFirebaseConfigured = () =>
  Object.values(getFirebaseConfig()).every((value) => value.length > 0);
