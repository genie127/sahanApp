# 남은 작업 체크리스트

> 최종 업데이트: 2026-09-26 (전면 재검토)
>
> **현재 상태**: 앱 코드 골격은 완성. 그러나 **푸시 알림이 실제로 동작하지 않는 상태**.
> 토큰이 발급되더라도 저장/전송 수단이 없고, 알림을 보낼 방법이 없음.
> Android Production 빌드(D2) 전에 F 섹션(푸시 알림 실제 연결) 작업이 필수.

---

## 완료된 작업

| 기능 | 파일 | 비고 |
|------|------|------|
| 웹뷰 (서버 로딩, 백버튼, 로딩 인디케이터) | `src/components/app-webview.tsx` | |
| 스플래시 화면 (AnimatedSplashOverlay) | `src/components/animated-icon.tsx` | |
| 탭 네비게이션 (홈/설정 외 4탭) | `src/app/_layout.tsx` | |
| 설정 화면 (알림 토글, 약관, 캐시, 버전) | `src/app/explore.tsx` | |
| 오프라인 화면 (네트워크 감지, 재시도) | `src/components/offline-notice.tsx` | 디자인 수정 완료 |
| 푸시 알림 훅 코드 작성 | `src/hooks/use-push-notification.ts` | ⚠️ 토큰이 허공에 뜸 — 아래 F 섹션 필수 |
| 딥링크 (`sahan://open?url=...`) | `src/hooks/use-deep-link.ts` | |
| EAS 프로젝트 연결 | `app.json` | projectId: 85e874bf |
| 약관/개인정보 URL 반영 | `src/constants/config.ts` | |
| 탭바 아이콘 교체 | `assets/images/tabIcons/` | |
| 푸시 토큰 서버 등록 골격 (F5) | `src/hooks/register-push-token.ts` | URL만 채우면 동작 |
| 누락 의존성 복구·정렬 | `package.json` | react-native-svg 복구, SDK 57 버전 정렬 |
| 탭바 타입 소스 정리 | `src/components/custom-tab-bar.tsx` | expo-router/tabs로 통일 |

---

## F. 푸시 알림 실제 연결 ← 지금 당장 해야 함

> 현재 상태: 코드는 있지만 **토큰이 발급되어도 저장되지 않고, 알림 발송 수단도 없음**.
> 실제로 알림이 한 번도 도착한 적 없다 = 푸시 기능 미동작 상태.
> 심사관이 "알림이 온다"는 것을 확인할 수 없으면 단순 웹뷰로 판정될 위험 있음.

---

### F1. Expo Push Token을 어딘가에 저장하기

**왜 필요한가**
현재 `use-push-notification.ts`는 토큰을 발급받아 `expoPushToken` 상태에 저장만 함.
그 값을 서버에 보내거나 기록해두지 않으면 알림을 보낼 대상을 알 수 없음.

**선택지 — 둘 중 하나만 하면 됨**

| 방법 | 난이도 | 설명 |
|------|--------|------|
| **A) 서버에 POST 전송** | ★★☆ | 홈페이지 서버에 `/api/register-token` 엔드포인트 만들고 토큰 저장. 나중에 서버에서 Expo Push API 호출해서 알림 발송. **실서비스용 권장.** |
| **B) 토큰을 화면에 표시 / 콘솔 출력** | ★☆☆ | 개발 단계에서 토큰을 직접 복사해서 Expo Push Tool로 테스트. 출시 전 A로 전환 필요. 지금 당장 동작 확인용. |

**지금 당장 할 것 (B 방법, 빠른 확인용)**
1. ~~`index.tsx`에서 토큰 `console.log` 출력~~ ✅ 코드 반영 완료
2. 실기기에서 앱 실행 → Metro 로그에서 토큰 복사 ← 실기기 필요
3. 아래 F2에서 그 토큰으로 테스트 발송

**파일**: `src/app/index.tsx` — 토큰 출력 코드 이미 반영됨

**상태**: ✅ 코드 완료 (실기기에서 토큰 확인만 남음)

> ⚠️ 실기기 필수: `use-push-notification.ts`의 `Device.isDevice` 체크 때문에
> 에뮬레이터/Expo Go에서는 토큰이 발급되지 않음. Development Build를 실기기에 설치해야 확인 가능.

---

### F2. 실제로 알림 한 번 받아보기 (필수 검증)

**왜 필요한가**
코드가 맞아도 실기기에서 실제로 알림이 도착하는지 확인하지 않으면 심사에서 기능 미동작으로 리젝될 수 있음.

**방법**
1. F1에서 토큰을 얻은 뒤
2. 브라우저에서 https://expo.dev/notifications 접속
3. `ExponentPushToken[xxxxxxxx]` 토큰 붙여넣기
4. 제목/내용 입력 → Send 버튼

**또는 curl로 직접**
```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[여기에_토큰]",
    "title": "테스트 알림",
    "body": "잘 도착했나요?",
    "data": { "url": "https://sahantest.dothome.co.kr" }
  }'
```

**확인할 것**
- [ ] 앱이 포그라운드일 때 알림 배너 표시되는지
- [ ] 앱이 백그라운드/종료 상태일 때 알림 오는지
- [ ] 알림 탭 시 앱 열리고 `data.url`의 페이지로 이동하는지

**상태**: ⬜ 미완료

---

### F3. iOS `app.json` 알림 권한 설명 문구 추가

**왜 필요한가**
iOS는 권한 요청 다이얼로그에 "왜 알림이 필요한지" 문구가 반드시 있어야 함.
없으면 App Store 심사에서 리젝됨 (ITMS-90683 오류).

**할 것**: `app.json`의 `ios` 섹션에 추가
```json
"ios": {
  "icon": "./assets/images/icon.png",
  "infoPlist": {
    "NSUserNotificationsUsageDescription": "공지사항 및 새 소식 알림을 받기 위해 알림 권한이 필요합니다."
  }
}
```

> ⚠️ 현재 `"icon": "./assets/expo.icon"` 으로 되어 있는데 이건 폴더 경로임. `.png` 파일로 수정 필요.

**상태**: ⬜ 미완료

---

### F4. Android 알림 아이콘 확인

**왜 필요한가**
Android에서 알림이 올 때 상태바에 표시되는 아이콘은 흰색 단색 PNG여야 함.
현재 `app.json`의 `expo-notifications` 플러그인이 `splash-icon.png`를 알림 아이콘으로 쓰고 있는데,
이 파일이 단색 흰색 PNG인지 확인 필요. 컬러 이미지면 검은 사각형으로 표시됨.

**할 것**
- `assets/images/splash-icon.png`가 배경 없는 흰색 단색 PNG인지 확인
- 아니면 별도의 알림 전용 단색 PNG 파일 만들어서 `app.json`에 지정

**상태**: ⬜ 확인 필요

---

### F5. (선택) 알림 발송 자동화 — 서버 연동

**왜 필요한가**
F1-B(수동 테스트)만 하고 출시하면 매번 토큰을 복사해서 수동 발송해야 함.
공지사항 등 정기 알림을 보내려면 서버 연동이 필요.

**방법 (출시 후 여유 생기면)**
1. 홈페이지 서버에 토큰 저장 DB 테이블 만들기 (device_tokens)
2. ~~앱 실행 시 토큰을 `POST`로 전송하는 클라이언트 코드~~ ✅ 골격 완료
   - `src/hooks/register-push-token.ts` 추가 — 토큰 발급 시 자동 전송 시도
   - `src/constants/config.ts`의 `PUSH_TOKEN_REGISTER_URL`에 서버 주소만 채우면 동작
   - 값이 비어 있으면 전송을 건너뜀 (개발 단계 안전 처리)
3. 공지 작성 시 서버에서 저장된 모든 토큰에 Expo Push API 호출
   - Expo Push API: `https://exp.host/--/api/v2/push/send`
   - 한 번에 최대 100개 토큰씩 배치 전송 가능

**상태**: 🟡 클라이언트 골격 완료 / 서버 엔드포인트 대기 (출시 후)

---

## B. 스타일 / UX

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| B1 | 스플래시 브랜드 이미지 교체 | `assets/images/splash-icon.png`, `app.json` | ⬜ |
| B2 | 앱 아이콘 교체 | `assets/images/icon.png`, `android-icon-*` | ⬜ |
| B3 | 탭바 아이콘 교체 | ✅ 완료 | |
| B4 | 오프라인 화면 디자인 개선 | `src/components/offline-notice.tsx` | ✅ 완료 |

---

## C. 외부 값 / 환경 연결

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| C1 | 약관/개인정보 URL 교체 | ✅ 완료 | |
| C2 | EAS 프로젝트 연결 | ✅ 완료 | projectId: 85e874bf |
| C3 | 실도메인 확보 후 `WEB_URL` 교체 | ⬜ 도메인 대기 | 출시 후 한 줄만 교체 |

---

## D. 빌드 / 배포 / QA

| # | 작업 | 상태 | 명령어 / 비고 |
|---|------|------|------|
| D1 | Development build 스킵 | ✅ 스킵 | |
| D2 | **Production AAB 빌드** | ⬜ F 섹션 완료 후 진행 | `npx eas-cli build -p android --profile production` |
| D3 | Play Console 등록 + 심사 제출 | ⬜ | 스크린샷, 앱 설명, 권한 사유 준비 필요 |
| D4 | Google Play 심사 대기 | ⬜ | 1~3일 |

**D3 제출 시 필요한 것**
- 앱 스크린샷 (최소 2장)
- 앱 설명 (한국어)
- 개인정보처리방침 URL: `https://sahantest.dothome.co.kr/bbs/content.php?co_id=privacy`
- 권한 사용 사유: 알림 권한 → "공지사항 및 업데이트 알림 수신용"

---

## E. iOS 출시 (맥북 확보 후)

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| E1 | Apple Developer 계정 등록 | ⬜ | 연간 $99 |
| E2 | `app.json` iOS 아이콘 경로 수정 | ✅ 완료 | `./assets/expo.icon` → `./assets/images/icon.png` 수정됨 |
| E3 | F3 iOS 알림 권한 문구 추가 | ✅ 완료 | `NSUserNotificationsUsageDescription` 추가됨 |
| E4 | iOS development build + 실기기 테스트 | ⬜ | `eas build --profile development -p ios` |
| E5 | Universal Link 설정 | ⬜ | 실도메인 확보 후 |
| E6 | Production IPA 빌드 | ⬜ | `eas build --profile production -p ios` |
| E7 | App Store Connect 등록 + 심사 제출 | ⬜ | |
| E8 | Apple 심사 대기 | ⬜ | 1~3일 |

---

## 전체 예상 일정 (재산정)

| 시점 | 작업 | 소요 |
|------|------|------|
| **오늘 (9/26)** | F1 토큰 확인 코드 추가 → 실기기 실행 → 토큰 복사 | 30분 |
| **오늘 (9/26)** | F2 Expo Push Tool로 알림 발송 테스트 | 30분 |
| **오늘 (9/26)** | F3 `app.json` iOS 알림 권한 문구 + 아이콘 경로 수정 | 15분 |
| **오늘 (9/26)** | F4 Android 알림 아이콘 PNG 단색 확인 | 15분 |
| **오늘 (9/26)** | B1/B2 에셋 교체 (아이콘, 스플래시) | 1~2시간 |
| **오늘 (9/26)** | D2 Production AAB 빌드 | 10~20분 (클라우드 빌드) |
| **내일 (9/27)** | D3 Play Console 등록 + 심사 제출 | 1~2시간 |
| **9/28~30** | D4 Google 심사 대기 | 1~3일 |
| 🟢 **Android 출시** | | |
| 맥북 확보 후 | E1~E8 iOS 출시 | 3~6일 |
| 🟢 **iOS 출시** | | |

---

## 심사 통과 체크리스트

- [ ] F2 완료: 실기기에서 푸시 알림 실제 수신 확인
- [x] F3 완료: iOS `NSUserNotificationsUsageDescription` 추가
- [ ] F4 완료: Android 알림 아이콘 단색 PNG 확인
- [ ] B1/B2: 앱 아이콘 · 스플래시 에셋 교체
- [ ] D3: 스크린샷 최소 2장, 권한 사유 문구 준비
- [x] 개인정보처리방침 URL 연결
- [x] 오프라인 화면 (크래시/백지 방지)
- [x] 네이티브 기능 (설정화면, 딥링크, 스플래시)
