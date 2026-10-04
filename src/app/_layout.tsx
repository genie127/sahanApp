import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Platform } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { CustomTabBar } from '@/components/custom-tab-bar';

SplashScreen.preventAutoHideAsync();

// 푸시 토큰을 서버에 등록
async function registerPushToken() {
  // 실제 기기에서만 동작 (시뮬레이터 제외)
  if (!Device.isDevice) return;

  // 알림 권한 요청
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  // Android 알림 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }

  // Expo 푸시 토큰 발급
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  // 서버에 토큰 등록
  try {
    await fetch('https://sahan.dothome.co.kr/api/push/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        device_id: Constants.sessionId ?? token,
      }),
    });
  } catch (_e) {
    // 네트워크 오류 무시 (앱 실행에 영향 없음)
  }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // 앱 시작 시 푸시 토큰 서버 등록
  useEffect(() => {
    registerPushToken();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fontsLoaded] = useFonts({
    'Pretendard-Thin':       require('@/assets/fonts/Pretendard-Thin.otf'),
    'Pretendard-ExtraLight': require('@/assets/fonts/Pretendard-ExtraLight.otf'),
    'Pretendard-Light':      require('@/assets/fonts/Pretendard-Light.otf'),
    'Pretendard-Regular':    require('@/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':     require('@/assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold':   require('@/assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':       require('@/assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold':  require('@/assets/fonts/Pretendard-ExtraBold.otf'),
    'Pretendard-Black':      require('@/assets/fonts/Pretendard-Black.otf'),
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // CustomTabBar가 absolute로 띄워지므로 기본 탭바 영역(tabBarHeight)은 0으로
          tabBarStyle: { height: 0, backgroundColor: 'transparent' },
        }}
      >
        {/* 웹 순서: SAHAN · MESSAGES · HOME · FILMOGRAPHY · SETTINGS */}
        <Tabs.Screen name="sahan"       options={{ title: 'SAHAN' }} />
        <Tabs.Screen name="messages"    options={{ title: 'MESSAGES' }} />
        <Tabs.Screen name="index"       options={{ title: 'HOME' }} />
        <Tabs.Screen name="filmography" options={{ title: 'FILMOGRAPHY' }} />
        <Tabs.Screen name="explore"     options={{ title: 'SETTINGS' }} />
      </Tabs>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
