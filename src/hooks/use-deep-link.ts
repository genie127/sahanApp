import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef } from 'react';

/**
 * 딥링크로 앱이 열렸을 때 대상 URL을 뽑아 콜백으로 넘기는 훅
 *
 * 지원 형식:
 *  - sahan://open?url=https://example.com/page  → 웹뷰를 해당 URL로 이동
 *  - sahan://<path>                             → WEB_URL 기준 경로로 이동(호출부에서 조합)
 *
 * cold start(앱 종료 상태에서 링크로 실행)와
 * warm start(앱 실행 중 링크 수신) 모두 처리한다.
 *
 * @param onDeepLink 대상 웹 URL 문자열을 받는 콜백
 */
export function useDeepLink(onDeepLink: (targetUrl: string) => void) {
  // 콜백을 ref로 유지해 리스너 재등록 없이 최신 콜백을 참조한다
  const callbackRef = useRef(onDeepLink);
  callbackRef.current = onDeepLink;

  // 링크 문자열에서 대상 URL을 추출한다
  const handleUrl = useCallback((url: string | null) => {
    if (!url) return;

    const parsed = Linking.parse(url);
    // 1순위: ?url= 쿼리 파라미터로 명시된 대상 URL
    const queryUrl = parsed.queryParams?.url;
    if (typeof queryUrl === 'string' && /^https?:\/\//i.test(queryUrl)) {
      callbackRef.current(queryUrl);
    }
    // path 기반 매핑이 필요하면 여기서 parsed.path 를 활용해 확장한다
  }, []);

  useEffect(() => {
    // cold start: 앱이 링크로 처음 실행된 경우 최초 URL 처리
    Linking.getInitialURL().then(handleUrl);

    // warm start: 앱 실행 중 수신되는 링크 처리
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, [handleUrl]);
}
