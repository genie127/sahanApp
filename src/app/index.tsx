import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import AppWebView, { type AppWebViewHandle } from '@/components/app-webview';
import { OfflineNotice } from '@/components/offline-notice';
import { WEB_URL } from '@/constants/config';
import { useDeepLink } from '@/hooks/use-deep-link';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { usePushNotification } from '@/hooks/use-push-notification';
import { setWebViewHandle } from '@/hooks/use-webview-registry';

/**
 * 홈 화면 = 메인 웹뷰
 *
 * - 네트워크 오프라인 시 오프라인 화면으로 대체
 * - 푸시 알림 토큰 등록 및 알림 탭 시 웹뷰 이동 처리
 * - 웹 첫 로딩 시점까지 스플래시 유지
 */
export default function HomeScreen() {
  const webViewRef = useRef<AppWebViewHandle>(null);
  const { isOffline } = useNetworkStatus();

  // 알림 탭 시: data.url 이 있으면 해당 웹 페이지로 이동
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const targetUrl = typeof data?.url === 'string' ? data.url : null;
      if (targetUrl) {
        webViewRef.current?.navigateTo(targetUrl);
      }
    },
    [],
  );

  usePushNotification(handleNotificationResponse);

  // 딥링크(sahan://open?url=...)로 앱이 열리면 해당 웹 페이지로 이동
  const handleDeepLink = useCallback((targetUrl: string) => {
    webViewRef.current?.navigateTo(targetUrl);
  }, []);

  useDeepLink(handleDeepLink);

  // 설정 화면(캐시 삭제 등)에서 홈 웹뷰에 접근할 수 있도록 핸들 등록
  useEffect(() => {
    setWebViewHandle(webViewRef.current);
    return () => setWebViewHandle(null);
  });

  // 스플래시 숨김은 AnimatedSplashOverlay(_layout.tsx)에서 처리한다.

  const handleRetry = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  if (isOffline) {
    return <OfflineNotice onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <AppWebView ref={webViewRef} initialUrl={WEB_URL} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
