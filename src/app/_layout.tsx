import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { CustomTabBar } from '@/components/custom-tab-bar';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
        {/* 웹 순서: SAHAN · MESSAGES · HOME · HISTORY · SETTINGS */}
        <Tabs.Screen name="sahan"       options={{ title: 'SAHAN' }} />
        <Tabs.Screen name="messages"    options={{ title: 'MESSAGES' }} />
        <Tabs.Screen name="index"       options={{ title: 'HOME' }} />
        <Tabs.Screen name="history" options={{ title: 'HISTORY' }} />
        <Tabs.Screen name="explore"     options={{ title: 'SETTINGS' }} />
      </Tabs>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
