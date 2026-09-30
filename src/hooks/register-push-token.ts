import { Platform } from 'react-native';

import { PUSH_TOKEN_REGISTER_URL } from '@/constants/config';

/**
 * 발급받은 Expo Push Token을 서버에 등록한다 (F5).
 *
 * 서버 엔드포인트(config.ts의 PUSH_TOKEN_REGISTER_URL)가 비어 있으면
 * 전송을 건너뛴다. 서버가 준비되기 전(개발 단계)에는 콘솔 출력만으로
 * 토큰을 확인하고, 엔드포인트가 채워지면 자동으로 POST 전송한다.
 *
 * @param token ExponentPushToken[...] 형식의 Expo Push Token
 * @returns 전송 성공 여부 (건너뛴 경우 false)
 */
export async function registerPushToken(token: string): Promise<boolean> {
  if (!PUSH_TOKEN_REGISTER_URL) {
    // 서버 엔드포인트 미설정 — 전송 건너뜀 (개발 단계)
    return false;
  }

  try {
    const response = await fetch(PUSH_TOKEN_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      console.warn(
        `푸시 토큰 등록 실패: 서버 응답 ${response.status}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn('푸시 토큰 등록 중 오류:', error);
    return false;
  }
}
