import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// expo-notifications는 Expo Go(SDK 53+)에서 import 자체가 크래시를 낸다.
// 런타임에 require하고 실패하면 null로 처리한다.
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}

const Notifications = getNotifications();

// 포그라운드 알림 표시 설정 (Expo Go에서는 무시됨)
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Expo Go에서는 무시
  }
}

async function setupAndroidChannel() {
  if (!Notifications) return;
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: '공지 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#208AEF',
    });
  } catch {
    // Expo Go에서는 무시
  }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) return null;
  if (!Device.isDevice) {
    console.warn('푸시 알림은 실제 기기에서만 동작합니다.');
    return null;
  }

  await setupAndroidChannel();

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenData.data;
  } catch (error) {
    console.warn('Expo Push Token 발급 실패:', error);
    return null;
  }
}

// Expo Go에서는 NotificationResponse 타입을 직접 참조할 수 없으므로 any 사용
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotificationResponse = any;

export function usePushNotification(
  onNotificationResponse?: (response: NotificationResponse) => void,
) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    if (!Notifications) return;

    try {
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) onNotificationResponse?.(response);
      });
    } catch {
      // Expo Go에서는 무시
    }

    try {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          onNotificationResponse?.(response);
        });
    } catch {
      // Expo Go에서는 무시
    }

    return () => {
      responseListener.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { expoPushToken };
}
