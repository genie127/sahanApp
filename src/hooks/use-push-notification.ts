import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * 포그라운드(앱 실행 중) 알림 표시 방식 설정
 *
 * SDK 57 특이사항: 기본적으로 포그라운드 알림이 표시되지 않는다.
 * shouldShowBanner / shouldShowList 를 true로 설정해야 화면에 노출된다.
 * (shouldShowAlert 는 deprecated)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Android 알림 채널 등록 (Android 8.0+ 필수)
 * 전체 공지 알림용 기본 채널 하나만 구성한다.
 */
async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: '공지 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#208AEF',
  });
}

/**
 * 알림 권한 요청 후 Expo Push Token 발급
 * @returns Expo Push Token 문자열 (실패 시 null)
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  // 실제 기기에서만 푸시 토큰 발급 가능 (에뮬레이터/시뮬레이터 불가)
  if (!Device.isDevice) {
    console.warn('푸시 알림은 실제 기기에서만 동작합니다.');
    return null;
  }

  await setupAndroidChannel();

  // 권한 확인 및 요청
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

  // EAS 프로젝트 ID (app.json의 extra.eas.projectId 또는 EAS 설정에서 주입)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenData.data;
  } catch (error) {
    console.warn('Expo Push Token 발급 실패:', error);
    return null;
  }
}

/**
 * 푸시 알림 등록 및 수신 리스너를 관리하는 훅
 *
 * @param onNotificationResponse 알림 탭 시 호출되는 콜백 (딥링크 이동 등에 사용)
 */
export function usePushNotification(
  onNotificationResponse?: (
    response: Notifications.NotificationResponse,
  ) => void,
) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // 토큰 발급
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // cold start: 앱이 완전히 종료된 상태에서 알림을 눌러 실행한 경우
    // 마지막 알림 응답을 1회 처리한다 (리스너는 이 케이스를 못 잡음)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) onNotificationResponse?.(response);
    });

    // 알림 탭 응답 리스너 (앱이 포그라운드/백그라운드 상태에서 알림을 눌러 열 때)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onNotificationResponse?.(response);
      });

    return () => {
      responseListener.current?.remove();
    };
    // onNotificationResponse는 호출부에서 안정적으로 전달한다고 가정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { expoPushToken };
}
