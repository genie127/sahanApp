import { Redirect, usePathname } from 'expo-router';

/**
 * 매칭되지 않는 라우트 처리
 *
 * 딥링크(sahan://open?url=...) 진입 시 Expo Router가 'open' 라우트를 찾지 못해
 * 이 화면으로 떨어진다. 홈(index)으로 리다이렉트하면 useDeepLink 훅이
 * 정상적으로 URL을 처리한다.
 */
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
