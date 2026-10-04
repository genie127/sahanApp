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
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { WEB_URL } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { setAuthState } from '@/hooks/use-auth-state';
import { setTabBarScrollDir } from '@/hooks/use-tabbar-scroll';

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
 * 웹뷰 내부 스크롤을 감지해서 RN으로 전달하는 injected JS
 *
 * 웹 원본:
 *   scrollTop <= 0   → 'top'
 *   scrollTop > last → 'down'
 *   scrollTop < last → 'up'
 *
 * window.ReactNativeWebView.postMessage()로 방향 문자열 전송
 */
const SCROLL_INJECT_JS = `
(function() {
  // window.open() 호출을 현재 창 이동으로 바꿔서 외부 브라우저 방지
  window.open = function(url) {
    if (url) window.location.href = url;
  };

  // 그누보드 로그인 상태(g5_is_member) 감지 → 앱으로 전달
  (function sendAuthState() {
    var isMember = (typeof g5_is_member !== 'undefined' && g5_is_member !== '');
    // 그누보드: g5_member_id 또는 mb_id 에 실제 아이디가 있음
    var memberId = '';
    if (typeof g5_member_id !== 'undefined' && g5_member_id) {
      memberId = g5_member_id;
    } else if (typeof mb_id !== 'undefined' && mb_id) {
      memberId = mb_id;
    } else if (isMember) {
      // fallback: g5_is_member 자체가 아이디인 경우
      memberId = String(g5_is_member);
    }
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'auth',
        isMember: isMember,
        memberId: memberId
      }));
    }
  })();

  var last = 0;
  var ticking = false;
  function onScroll() {
    var cur = window.scrollY || document.documentElement.scrollTop || 0;
    if (cur < 0) cur = 0;
    var dir = cur <= 0 ? 'top' : cur > last ? 'down' : 'up';
    last = cur;
    if (window.ReactNativeWebView) {
      // dir 외에 scrollY(px)도 함께 전달 — RN에서 threshold 판단용
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', dir: dir, y: cur }));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();
true;
`;

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

  // 웹뷰 스크롤 메시지 수신 → 탭바 hide/show 상태 갱신
  // SCROLL_THRESHOLD px 이상 내려간 상태에서 down일 때만 탭바 숨김
  const SCROLL_THRESHOLD = 80; // 이 px 이상 스크롤됐을 때만 탭바 숨김
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      // 로그인 상태 업데이트
      if (data?.type === 'auth') {
        console.log('🔐 auth state:', data.isMember, data.memberId);
        setAuthState({ isMember: !!data.isMember, memberId: data.memberId ?? '' });
      }
      // 스크롤 방향 → 탭바 hide/show
      if (data?.type === 'scroll' && data?.dir) {
        const dir: 'up' | 'down' | 'top' = data.dir;
        const y: number = typeof data.y === 'number' ? data.y : 0;
        if (dir === 'down' && y < SCROLL_THRESHOLD) return;
        setTabBarScrollDir(dir);
      }
    } catch {
      // 파싱 실패는 무시
    }
  }, []);

  // 외부 도메인은 시스템 브라우저로 열고 웹뷰 내 로딩은 막는다
  const handleShouldStartLoad = (request: { url: string; navigationType?: string }) => {
    const { url } = request;

    // http(s)가 아닌 스킴(tel:, mailto:, 카카오 등)은 시스템에 위임
    // 단, //로 시작하는 프로토콜 상대 URL은 https로 정규화해서 처리
    if (!/^https?:\/\//i.test(url) && !/^\/\//i.test(url)) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    try {
      // 프로토콜 상대 URL (//) → https로 정규화
      const normalizedUrl = url.startsWith('//') ? 'https:' + url : url;
      const reqHost = new URL(normalizedUrl).host;
      const baseHost = new URL(WEB_URL).host;

      // 같은 도메인(서브도메인 포함)이면 앱 내에서 열기
      if (reqHost === baseHost || reqHost.endsWith('.' + baseHost)) {
        return true;
      }

      // 외부 도메인 → 시스템 브라우저
      Linking.openURL(normalizedUrl).catch(() => {});
      return false;
    } catch {
      // URL 파싱 실패 시 웹뷰에서 그대로 진행
      return true;
    }
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
        // target="_blank" / window.open() 링크를 도메인 기준으로 분기
        onOpenWindow={(syntheticEvent) => {
          const { targetUrl } = syntheticEvent.nativeEvent;
          if (!targetUrl) return;
          // http(s) 아닌 스킴은 시스템에 위임 (// 상대 URL 제외)
          if (!/^https?:\/\//i.test(targetUrl) && !/^\/\//i.test(targetUrl)) {
            Linking.openURL(targetUrl).catch(() => {});
            return;
          }
          try {
            const normalizedUrl = targetUrl.startsWith('//') ? 'https:' + targetUrl : targetUrl;
            const reqHost = new URL(normalizedUrl).host;
            const baseHost = new URL(WEB_URL).host;
            if (reqHost === baseHost || reqHost.endsWith('.' + baseHost)) {
              // 같은 도메인 → 웹뷰 내에서 열기
              const safeUrl = JSON.stringify(normalizedUrl);
              webViewRef.current?.injectJavaScript(`window.location.href = ${safeUrl}; true;`);
            } else {
              // 외부 도메인 → 시스템 브라우저
              Linking.openURL(normalizedUrl).catch(() => {});
            }
          } catch {
            Linking.openURL(targetUrl).catch(() => {});
          }
        }}
        onMessage={handleMessage}
        injectedJavaScript={SCROLL_INJECT_JS}
        // 웹 저장소/세션 유지
        domStorageEnabled
        javaScriptEnabled
        // 당겨서 새로고침 (iOS)
        pullToRefreshEnabled
        // 미디어 자동재생 정책
        allowsInlineMediaPlayback
        // Android: 새 창(target="_blank") 요청을 시스템 브라우저로 안 보내고 onOpenWindow로 받기
        // setSupportMultipleWindows=false 로 설정해야 onOpenWindow 콜백이 정상 동작
        setSupportMultipleWindows={false}
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 SahanApp/1.0"
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
