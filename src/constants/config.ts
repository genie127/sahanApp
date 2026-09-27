/**
 * 앱 전역 설정 상수
 *
 * ⚠️ 웹 서버 주소는 현재 임시 서버입니다.
 * 실도메인 연결 시 아래 WEB_URL 값만 교체하면 됩니다.
 */

// 웹뷰가 로딩할 기본 웹 주소 (임시 서버)
export const WEB_URL = 'https://sahantest.dothome.co.kr';

// 딥링크용 앱 스킴 (app.json의 scheme과 동일해야 함)
export const APP_SCHEME = 'sahan';

// 개인정보처리방침 / 이용약관 URL
export const PRIVACY_POLICY_URL = `${WEB_URL}/bbs/content.php?co_id=privacy`;
export const TERMS_URL = `${WEB_URL}/bbs/content.php?co_id=provision`;

// 웹뷰에서 앱 내부 브라우저(WebView)로 열지 않고
// 외부 브라우저로 열어야 하는 도메인 (결제, 소셜 로그인 등)
export const EXTERNAL_HOSTS: string[] = [
  // 예: 'pay.example.com',
];
