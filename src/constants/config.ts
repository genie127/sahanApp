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

/**
 * Expo Push Token 등록 엔드포인트 (F5)
 *
 * ⚠️ 아직 서버 엔드포인트가 없으므로 빈 문자열입니다.
 * 서버에 토큰 저장 API가 준비되면 아래 값만 채우면 자동으로 전송됩니다.
 * (빈 값이면 토큰 전송을 건너뜁니다 — 개발 단계에서는 콘솔 출력으로 대체)
 *
 * 예: `${WEB_URL}/api/push/register`
 */
export const PUSH_TOKEN_REGISTER_URL = '';
