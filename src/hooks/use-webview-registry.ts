import type { AppWebViewHandle } from '@/components/app-webview';

/**
 * 홈 화면의 웹뷰 핸들을 앱 전역에서 공유하기 위한 경량 레지스트리
 *
 * 탭 구조상 설정 화면(explore)에서 홈 화면의 웹뷰 ref에 직접 접근할 수 없어서,
 * 홈에서 등록한 핸들을 여기 보관하고 설정 화면에서 꺼내 쓴다.
 * (캐시 삭제 버튼 등에서 사용)
 */
let webViewHandle: AppWebViewHandle | null = null;

export function setWebViewHandle(handle: AppWebViewHandle | null) {
  webViewHandle = handle;
}

export function getWebViewHandle(): AppWebViewHandle | null {
  return webViewHandle;
}
