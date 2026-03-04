import { Platform } from 'react-native';

let Notifications = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    Notifications = null;
  }
}

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web' || !Notifications) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-health', {
      name: 'Günlük Sağlık Hatırlatmaları',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90E2',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;
};

export const scheduleDailyNotification = async () => {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏥 Sağlık Kontrolü',
        body: 'Bugünün aktivitelerini ve kan şekerinizi kaydetmeyi unutmayın!',
        data: { type: 'daily-reminder' },
      },
      trigger: {
        type: 'daily',
        hour: 9,
        minute: 0,
        channelId: 'daily-health',
      },
    });
  } catch (error) {
    console.log('Bildirim Expo Go\'da desteklenmiyor:', error.message);
  }
};

export const sendImmediateNotification = async (title, body) => {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (error) {
    console.log('Bildirim gönderilemedi:', error.message);
  }
};
