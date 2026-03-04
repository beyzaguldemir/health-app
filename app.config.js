// app.config.js - app.json yerine geçer; .env'den extra alanlarını okur
// Expo SDK 49+ .env dosyasını otomatik yükler

export default {
  expo: {
    name: 'Health Tracker',
    slug: 'health-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: [],
        },
      ],
      'expo-font',
    ],
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.SCHEDULE_EXACT_ALARM',
      ],
      package: 'com.healthtracker.app',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.healthtracker.app',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
    },
    extra: {
      eas: {
        projectId: "d6b60532-36a3-4416-8a01-2a24b9b17e1a"
      }
    },
  },
};
