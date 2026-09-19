import { useFocusEffect } from 'expo-router';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Linking,
    Platform,
    StyleSheet,
    useColorScheme,
    View
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { EXTERNAL_HOSTS, WEB_URL } from '@/constants/config';
import { Colors } from '@/constants/theme';

export type AppWebViewHandle = {
  /** 웹뷰를 특정 URL로 이동시킨다 (딥링크/알림 이동용) */
  navigateTo: (url: string) => void;
  /** 현재 페이지 새로고침 */
  reload: () => void;
  /** 웹뷰 캐시 삭제 (디스크 파일 포함) */
  clearCache: () => void;
};

type Props = {
  /** 초기 로딩 URL (기본값: WEB_URL) */
  initialUrl?: string;
};

/**
 * 서버 웹을 감싸는 메인 웹뷰 컴포넌트
 *
 * - 로딩 중 인디케이터 표시
 * - Android 하드웨어 백버튼 → 웹뷰 히스토리 back
 * - 외부 도메인(결제/로그인 등)은 시스템 브라우저로 열기
 */
const AppWebView = forwardRef<AppWebViewHandle, Props>(function AppWebView(
  { initialUrl = WEB_URL },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  useImperativeHandle(ref, () => ({
    navigateTo: (url: string) => {
      const safeUrl = JSON.stringify(url);
      webViewRef.current?.injectJavaScript(`window.location.href = ${safeUrl}; true;`);
    },
    reload: () => webViewRef.current?.reload(),
    clearCache: () => {
      // 디스크 파일 포함 캐시 삭제 후 현재 페이지 재로딩
      webViewRef.current?.clearCache?.(true);
      webViewRef.current?.reload();
    },
  }));

  // Android 하드웨어 백버튼: 웹뷰 히스토리가 있으면 뒤로, 없으면 기본 동작
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const onBackPress = () => {
        if (canGoBackRef.current) {
          webViewRef.current?.goBack();
          return true; // 앱 종료 막고 웹뷰 back 처리
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  const handleNavStateChange = (navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
  };

  // 외부 도메인은 시스템 브라우저로 열고 웹뷰 내 로딩은 막는다
  const handleShouldStartLoad = (request: { url: string }) => {
    const { url } = request;

    // http(s)가 아닌 스킴(tel:, mailto:, 카카오 등)은 시스템에 위임
    if (!/^https?:\/\//i.test(url)) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    if (EXTERNAL_HOSTS.length > 0) {
      try {
        const host = new URL(url).host;
        if (EXTERNAL_HOSTS.some((h) => host.includes(h))) {
          Linking.openURL(url).catch(() => {});
          return false;
        }
      } catch {
        // URL 파싱 실패 시 웹뷰에서 그대로 진행
      }
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        // 웹 저장소/세션 유지
        domStorageEnabled
        javaScriptEnabled
        // 당겨서 새로고침 (iOS)
        pullToRefreshEnabled
        // 미디어 자동재생 정책
        allowsInlineMediaPlayback
        style={styles.webview}
      />
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: colors.background },
          ]}
          pointerEvents="none">
          <ActivityIndicator size="large" color="#208AEF" />
        </View>
      )}
    </View>
  );
});

export default AppWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
