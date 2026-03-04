import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const init = async () => {
      if (Platform.OS !== 'web') {
        try {
          const { registerForPushNotificationsAsync, scheduleDailyNotification } =
            require('./src/services/notificationService');
          await registerForPushNotificationsAsync();
          await scheduleDailyNotification();
        } catch (e) {
          // Bildirimler Expo Go'da kısıtlıdır
        }
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
