# 남은 작업 체크리스트

> 최종 업데이트: 2026-10-04
>
> **현재 상태 한 줄 요약**
> 앱 코드 골격 완성 + 타입/의존성 정합성 확보 완료.
> 남은 핵심 블로커: **① 아이콘 에셋 교체**, **② 실기기 푸시 검증**.
> 이 둘만 끝나면 Android Production 빌드 → 심사 제출 가능.

---

## ✅ 완료된 작업

| 기능 | 파일 | 비고 |
|------|------|------|
| 웹뷰 (서버 로딩, 백버튼, 로딩 인디케이터) | `src/components/app-webview.tsx` | |
| 스플래시 화면 (AnimatedSplashOverlay) | `src/components/animated-icon.tsx` | |
| 탭 네비게이션 (홈/설정 외 4탭) | `src/app/_layout.tsx` | |
| 설정 화면 (알림 토글, 약관, 캐시, 버전) | `src/app/explore.tsx` | |
| 오프라인 화면 (네트워크 감지, 재시도) | `src/components/offline-notice.tsx` | |
| 딥링크 (`sahan://open?url=...`) | `src/hooks/use-deep-link.ts` | |
| 푸시 알림 훅 코드 + 토큰 콘솔 출력 (F1) | `src/hooks/use-push-notification.ts` | 토큰 발급 코드 완료, 실기기 확인만 남음 |
| 푸시 토큰 서버 등록 골격 (F5) | `src/hooks/register-push-token.ts` | URL만 채우면 동작 |
| EAS 프로젝트 연결 | `app.json` | projectId: 85e874bf |
| 약관/개인정보 URL 반영 | `src/constants/config.ts` | |
| iOS 알림 권한 문구 (F3) | `app.json` > `ios.infoPlist` | `NSUserNotificationsUsageDescription` 추가됨 |
| iOS 아이콘 경로 수정 (E2) | `app.json` | `./assets/images/icon.png` 로 수정됨 |
| 탭바 아이콘 교체 | `assets/images/tabIcons/` | |
| 탭바 타입 소스 정리 | `src/components/custom-tab-bar.tsx` | expo-router/tabs 로 통일 |
| 누락 의존성 복구·정렬 | `package.json` | SDK 57 버전 정렬 |

---

## 🔴 블로커 1 — 앱 아이콘 에셋 교체 (B2)

**문제**: 현재 `icon.png` / `android-icon-foreground.png` / `android-icon-monochrome.png` 가
417×94 비정사각형 → expo-doctor 스키마 검증 실패 → 빌드/심사에서 막힘.

**해야 할 것**

| 파일 | 요구 사양 |
|------|-----------|
| `assets/images/icon.png` | 1024×1024 PNG, 정사각형, iOS/Android 공용 |
| `assets/images/android-icon-foreground.png` | 1024×1024 PNG, 투명 배경, 안드로이드 어댑티브 전경 |
| `assets/images/android-icon-background.png` | 1024×1024 PNG, 단색 배경 (#E6F4FE) |
| `assets/images/android-icon-monochrome.png` | 1024×1024 PNG, 흰색 단색 (Android 13+ 테마 아이콘) |
| `assets/images/favicon.png` | 32×32 또는 48×48 PNG (웹) |

**교체 후 확인**
- [ ] `npx expo-doctor` 실행 → 스키마 오류 없음 확인

**상태**: ⬜ 미완료

---

## 🔴 블로커 2 — 푸시 알림 실기기 검증 (F2)

**선행 조건**: 실기기(Android) + Development Build 설치
```bash
eas build --profile development -p android
```

**확인 항목**
- [ ] 포그라운드 상태에서 알림 배너 표시
- [ ] 백그라운드/종료 상태에서 알림 수신
- [ ] 알림 탭 시 앱 열리고 `data.url` 페이지로 이동

**테스트 방법** (토큰 얻은 후)
1. Metro 로그에서 `ExponentPushToken[…]` 복사
2. https://expo.dev/notifications 접속 → 토큰 붙여넣기 → 발송
   또는 curl:
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

**상태**: ⬜ 미완료 (실기기 필요)

---

## 🟡 후속 1 — Android 알림 아이콘 단색 확인 (F4)

`app.json`의 `expo-notifications` 플러그인이 `splash-icon.png`를 알림 아이콘으로 사용.
Android 상태바 알림 아이콘은 **배경 없는 흰색 단색 PNG** 여야 함. 컬러 이미지면 검은 사각형으로 표시됨.

- [ ] `assets/images/splash-icon.png`가 흰색 단색 PNG인지 확인
- [ ] 아니면 별도 단색 PNG 만들어서 `app.json`의 `expo-notifications.icon`에 지정

**상태**: ⬜ 확인 필요

---

## 🟡 후속 2 — 스플래시 브랜드 이미지 교체 (B1)

- [ ] `assets/images/splash-icon.png` 교체 (브랜드 이미지)
- [ ] `app.json` `expo-splash-screen.image` 경로 및 `imageWidth` 확인

**상태**: ⬜ 미완료

---

## 🟢 빌드 · 배포 (블로커 1·2 완료 후)

| # | 작업 | 명령어 | 선행 |
|---|------|--------|------|
| D-dev | Development Build (F2 검증용) | `eas build --profile development -p android` | - |
| D2 | Production AAB 빌드 | `eas build -p android --profile production` | 블로커 1·2 완료 |
| D3 | Play Console 등록 + 심사 제출 | — | D2 완료 |
| D4 | Google Play 심사 대기 | — | D3 완료 (1~3일) |

**D3 제출 시 준비물**
- 앱 스크린샷 최소 2장
- 앱 설명 (한국어)
- 개인정보처리방침 URL: `https://sahantest.dothome.co.kr/bbs/content.php?co_id=privacy`
- 권한 사유: 알림 → "공지사항 및 업데이트 알림 수신용"

---

## 🔵 iOS 출시 (맥북 확보 후)

| # | 작업 | 비고 |
|---|------|------|
| E1 | Apple Developer 계정 등록 | 연 $99, 승인 1~2일 |
| E4 | iOS dev build + 실기기 테스트 | `eas build --profile development -p ios` |
| E5 | Universal Link 설정 | 실도메인 확보 후 |
| E6 | Production IPA 빌드 | `eas build -p ios --profile production` |
| E7 | App Store Connect 등록 + 심사 제출 | — |
| E8 | Apple 심사 대기 | 1~3일 |

---

## ⚪ 선택 / 정리성 작업

- [ ] `.expo` git 추적 제거: `git rm -r --cached .expo`
- [ ] `expo lint` React Compiler 경고 정리 (애니메이션/렌더링 로직, 크래시 아님)
- [ ] Node.js LTS 업그레이드 (현재 v20.11.0 → 권장 ≥20.19.4, 빌드 경고 제거용)
- [ ] F5 서버 엔드포인트 준비 후 `PUSH_TOKEN_REGISTER_URL` 입력 (자동 토큰 등록)

---

## 권장 진행 순서

```
① 아이콘 에셋 교체 (정사각형 1024×1024)   ← 지금 당장
② expo-doctor 확인
③ Development Build → 실기기 설치
④ F2 푸시 알림 검증 (3케이스)
⑤ F4 알림 아이콘 단색 확인
⑥ D2 Production AAB 빌드
⑦ D3 Play Console 제출
⑧ D4 심사 대기 → 🟢 Android 출시
────────── (맥북 확보 후) ──────────
⑨ E1~E8 → 🟢 iOS 출시
```

---

## 심사 통과 체크리스트

- [ ] 아이콘 정사각형 (1024×1024) 교체 완료
- [ ] 실기기 푸시 알림 실제 수신 확인 (F2)
- [ ] Android 알림 아이콘 단색 PNG 확인 (F4)
- [ ] 스플래시 이미지 교체 (B1)
- [ ] 스크린샷 최소 2장, 권한 사유 문구 준비 (D3)
- [x] iOS `NSUserNotificationsUsageDescription` 추가 (F3)
- [x] 개인정보처리방침 URL 연결
- [x] 오프라인 화면 (크래시/백지 방지)
- [x] 네이티브 기능 (설정화면, 딥링크, 스플래시)
