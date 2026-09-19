# sahan 웹뷰앱 개발 가이드

Expo SDK 57 기반 React Native 웹뷰앱입니다.

## 현재까지 구현된 것

| 기능 | 상태 | 파일 |
|------|------|------|
| 웹뷰 (서버 웹 로딩) | ✅ | `src/components/app-webview.tsx`, `src/app/index.tsx` |
| Android 백버튼 → 웹뷰 뒤로가기 | ✅ | `src/components/app-webview.tsx` |
| 로딩 인디케이터 | ✅ | `src/components/app-webview.tsx` |
| 오프라인 화면 | ✅ | `src/components/offline-notice.tsx`, `src/hooks/use-network-status.ts` |
| 네비게이션 바 (홈/설정 탭) | ✅ | `src/components/app-tabs.tsx` |
| 설정 화면 (알림/약관/버전) | ✅ | `src/app/explore.tsx` |
| 푸시 알림 (Expo Push) | ✅ | `src/hooks/use-push-notification.ts` |
| 딥링크 (scheme: sahan) | ✅ | `app.json` scheme + 알림 data.url 처리 |
| 스플래시 화면 | ✅ | `app.json` + `src/components/animated-icon.tsx` |

## 중요 (SDK 57 특이사항)

1. **푸시 알림은 Expo Go에서 동작하지 않습니다.** (SDK 53+)
   → 반드시 **development build**를 만들어서 실기기에서 테스트해야 합니다.
2. **포그라운드(앱 실행 중) 알림 표시**는 기본 비활성.
   → `use-push-notification.ts`의 `setNotificationHandler`에서
   `shouldShowBanner` / `shouldShowList`로 표시하도록 이미 설정됨.
3. **푸시 토큰**은 실제 기기에서만 발급됩니다. 에뮬레이터 불가.

## 실행 방법

### 1. 로컬 개발 (웹뷰/UI 확인 - 푸시 제외)

```
npm run android
```

Android 에뮬레이터 또는 USB 연결된 실기기에서 실행됩니다.
(에뮬레이터에서는 푸시 토큰이 발급되지 않지만 웹뷰/설정/오프라인은 확인 가능)

### 2. 푸시 알림까지 테스트 (development build 필요)

```
npm install -g eas-cli     # 최초 1회
eas login                  # Expo 계정 로그인
eas build --profile development --platform android
```

빌드된 APK를 실기기에 설치 후 실행하면 푸시 토큰이 발급됩니다.

### 3. 푸시 알림 발송 테스트

앱 실행 시 콘솔에 출력되는 Expo Push Token을 복사하여
[Expo Push Tool](https://expo.dev/notifications) 에서 발송 테스트.

특정 웹 페이지로 이동시키려면 알림 data에 `url` 필드를 넣으면 됩니다.
```json
{
  "to": "ExponentPushToken[...]",
  "title": "공지",
  "body": "새 소식이 있어요",
  "data": { "url": "https://sahantest.dothome.co.kr/notice/1" }
}
```

## 출시 빌드 (Android)

```
eas build --profile production --platform android
```

생성된 AAB를 Google Play Console에 업로드.

## 남은 작업 (TODO)

- [ ] 실도메인 연결 시 `src/constants/config.ts`의 `WEB_URL` 교체
- [ ] `config.ts`의 개인정보처리방침/이용약관 실제 URL 경로 확인
- [ ] 브랜드 로고로 스플래시/알림 아이콘 교체 (현재 Expo 기본 로고)
- [ ] `app.json`의 `android.package` 최종 확정 (현재 `kr.co.dothome.sahantest`)
- [ ] EAS 프로젝트 연결 후 `app.json`에 projectId 반영 (`eas init` 시 자동)
- [ ] 유니버설 링크(실도메인) 설정 — 실도메인 연결 후
- [ ] iOS 대응 (추석 이후, 맥북 확보 시)

## 환경 참고

- Node CLI 도구(`npx expo install`, `tsc`)가 이 PC에서 간헐적으로
  크래시(access violation)하는 현상이 있었음.
  의존성 설치는 `npm install`로 버전 직접 지정하여 완료함.
  타입 검증은 IDE 진단으로 확인함.
