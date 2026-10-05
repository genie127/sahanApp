# 남은 작업 체크리스트

> 최종 업데이트: 2026-10-05
>
> **현재 상태 한 줄 요약**
> 블로커 1·2 모두 해소. 아이콘 에셋 전부 1024×1024 교체 완료,
> 푸시 토큰 서버 등록 URL 연동 완료.
> **지금 당장 Production AAB 빌드 → Play Console 심사 제출 가능.**

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
| 푸시 알림 훅 + 토큰 발급 (F1) | `src/hooks/use-push-notification.ts` | |
| 푸시 토큰 서버 등록 연동 (F5) ✅ **NEW** | `src/hooks/register-push-token.ts` + `src/constants/config.ts` | URL 실제 값 채워짐 |
| 설정 화면 Push Token 표시 | `src/app/explore.tsx` | 탭하면 Alert로 전체 토큰 표시 |
| google-services.json 연동 | `google-services.json` / `app.json` | FCM 연동 완료 |
| FCM V1 서비스 계정 키 Expo 등록 | EAS Credentials | sahan-2026 프로젝트 |
| 푸시 알림 실기기 수신 확인 (F2) | — | preview 빌드로 수신 확인 ✅ |
| 크론잡 스케줄러 (서버) | `send_push.php` | 매년 10/21 00:00 발송 예정 |
| EAS 프로젝트 연결 | `app.json` | projectId: 85e874bf |
| 약관/개인정보 URL 반영 | `src/constants/config.ts` | |
| iOS 알림 권한 문구 (F3) | `app.json` > `ios.infoPlist` | |
| iOS 아이콘 경로 수정 (E2) | `app.json` | |
| 탭바 아이콘 교체 | `assets/images/tabIcons/` | |
| 탭바 타입 소스 정리 | `src/components/custom-tab-bar.tsx` | |
| 누락 의존성 복구·정렬 | `package.json` | SDK 57 버전 정렬 |
| 앱 아이콘 에셋 교체 (B2) ✅ **NEW** | `assets/images/` | 전 파일 1024×1024 PNG 정사각형 확인 |

---

## 🟡 후속 1 — Android 알림 아이콘 단색 확인 (F4)

`app.json`의 `expo-notifications` 플러그인이 `android-icon-monochrome.png`를 알림 아이콘으로 사용.
Android 상태바 알림 아이콘은 **배경 없는 흰색 단색 PNG** 여야 함. 컬러 이미지면 검은 사각형으로 표시됨.

- [ ] `assets/images/android-icon-monochrome.png`가 흰색 단색 PNG인지 육안·실기기 확인
- [ ] 아니면 별도 단색 PNG 만들어서 `app.json`의 `expo-notifications.icon`에 지정

**상태**: ⬜ 확인 필요

---

## 🟡 후속 2 — 스플래시 브랜드 이미지 교체 (B1)

현재 `splash-icon.png`는 임시 이미지. 실제 브랜드 이미지로 교체 필요.

- [ ] `assets/images/splash-icon.png` → 브랜드 로고 이미지로 교체
- [ ] `app.json` `expo-splash-screen.imageWidth` 값 브랜드 이미지 크기에 맞게 조정

**상태**: ⬜ 미완료

---

## 🟢 빌드 · 배포 (지금 진행 가능)

| # | 작업 | 명령어 | 선행 |
|---|------|--------|------|
| D2 | Production AAB 빌드 | `eas build -p android --profile production` | 완료 ✅ |
| D3 | Play Console 등록 + 심사 제출 | — | D2 완료 후 |
| D4 | Google Play 심사 대기 | — | D3 완료 (1~3일) |

**D3 제출 시 준비물**
- 앱 스크린샷 최소 2장
- 앱 설명 (한국어)
- 개인정보처리방침 URL: `https://sahan.dothome.co.kr/bbs/content.php?co_id=privacy`
- 권한 사유: 알림 → "공지사항 및 업데이트 알림 수신용"

---

## 🔵 iOS 출시 (Apple Developer 계정 승인 후)

### ✅ 계정 없이 미리 완료한 것

| 항목 | 파일 | 비고 |
|------|------|------|
| Bundle ID 설정 | `app.json` > `ios.bundleIdentifier` | `kr.co.dothome.sahan` |
| supportsTablet false 설정 | `app.json` > `ios.supportsTablet` | |
| EAS iOS 빌드 profile 추가 | `eas.json` | development / preview / production |
| 앱 이름 대문자 변경 | `app.json` > `name` | `SAHAN` |
| 권한 문구 전체 작성 | `app.json` > `ios.infoPlist` | 알림/카메라/사진/마이크 |

### ⬜ 계정 승인 후 할 것

| # | 작업 | 비고 |
|---|------|------|
| E1 | Apple Developer 계정 등록 + 승인 대기 | 연 $99, 1~2일 |
| E2 | APNs 키 발급 + Expo에 등록 | developer.apple.com → Keys |
| E3 | iOS preview 빌드 + 실기기 테스트 | `eas build --profile preview -p ios` |
| E4 | iOS 푸시 알림 실기기 확인 | |
| E5 | Production IPA 빌드 | `eas build --profile production -p ios` |
| E6 | App Store Connect 등록 + 스크린샷 준비 | 최소 3장 (iPhone 6.5") |
| E7 | 심사 제출 | |
| E8 | Apple 심사 대기 | 1~3일 |

---

## ⚪ 선택 / 정리성 작업

- [ ] `.expo` git 추적 제거: `git rm -r --cached .expo`
- [ ] `expo lint` React Compiler 경고 정리
- [ ] Node.js LTS 업그레이드 (현재 v20.11.0 → 권장 ≥20.19.4)
- [ ] 설정 화면 Push Token 표시 UI → 출시 전 제거 (보안)

---

## 권장 진행 순서

```
① F4 알림 아이콘 단색 확인 (android-icon-monochrome.png)   ← 지금 당장
② B1 스플래시 브랜드 이미지 교체 (선택, 심사 영향 없음)
③ D2 Production AAB 빌드  ← ① 끝나면 바로 가능
④ D3 Play Console 제출 + 스크린샷·설명 준비
⑤ D4 심사 대기 (1~3일) → 🟢 Android 출시
────────── (맥북 확보 후) ──────────
⑥ E1~E8 → 🟢 iOS 출시
```

---

## 남은 일정 예상 (2026-10-05 기준)

| 날짜 | 작업 |
|------|------|
| **10/05 (오늘)** | F4 알림 아이콘 단색 확인 → D2 Production AAB 빌드 시작 |
| **10/06 (화)** | 빌드 완료 → D3 Play Console 등록 + 심사 제출 |
| **10/07~09** | D4 Google Play 심사 대기 (보통 1~3일) |
| **10/09~10 (목~금)** | 🟢 Android 출시 (심사 통과 시) |
| **맥북 확보 후** | E1 Apple Developer 계정 → E2~E8 iOS 출시 (추가 1주 내외) |

> B1 스플래시 교체는 심사 통과와 무관하므로 출시 후 업데이트로 처리 가능.

---

## 심사 통과 체크리스트

- [x] 아이콘 정사각형 (1024×1024) 교체 완료 ✅
- [ ] Android 알림 아이콘 단색 PNG 확인 (F4)
- [ ] 스플래시 이미지 교체 (B1) — 선택사항
- [x] 푸시 토큰 서버 등록 연동 완료 (F5) ✅
- [ ] 설정 화면 Push Token 표시 UI 제거 (출시 전)
- [ ] 스크린샷 최소 2장, 권한 사유 문구 준비 (D3)
- [x] 푸시 알림 실기기 수신 확인 (F2) ✅
- [x] FCM V1 서비스 계정 키 Expo 등록 ✅
- [x] google-services.json 연동 ✅
- [x] iOS `NSUserNotificationsUsageDescription` 추가 (F3) ✅
- [x] iOS Bundle ID 설정 (`kr.co.dothome.sahan`) ✅
- [x] 앱 이름 SAHAN 대문자 변경 ✅
- [x] EAS iOS 빌드 profile 추가 ✅
- [x] 개인정보처리방침 URL 연결 ✅
- [x] 오프라인 화면 (크래시/백지 방지) ✅
- [x] 네이티브 기능 (설정화면, 딥링크, 스플래시) ✅
