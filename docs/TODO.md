# sahan 앱 — 남은 작업 (2026-10-09 기준)

> 오늘은 원래 일정상 "출시 예정일"이었으나, Production 빌드가 아직 완료되지 않은 상태.
> 아래 순서대로 진행하면 됩니다.

---

## ✅ 완료된 모든 것

| 기능 | 비고 |
|------|------|
| 웹뷰 (서버 로딩, 백버튼, 로딩 인디케이터) | |
| 스플래시 애니메이션 (AnimatedSplashOverlay) | |
| 탭 네비게이션 | |
| 설정 화면 (알림 토글, 약관, 캐시, 버전) | |
| 오프라인 화면 (네트워크 감지, 재시도) | |
| 딥링크 (`sahan://open?url=...`) | |
| 푸시 알림 훅 + 토큰 발급 | |
| 푸시 토큰 서버 등록 연동 | |
| google-services.json 연동 (FCM) | |
| FCM V1 서비스 계정 키 Expo 등록 | |
| 푸시 알림 실기기 수신 확인 (Android) | preview 빌드 |
| 크론잡 스케줄러 (서버) | 매년 10/21 00:00 발송 |
| 앱 아이콘 에셋 교체 (1024×1024) | |
| Android 알림 아이콘 단색 교체 | |
| 스플래시 브랜드 이미지 교체 | |
| 탭바 아이콘 교체 | |
| iOS Bundle ID / 권한 문구 / 아이콘 설정 | |
| EAS iOS 빌드 profile 추가 | |
| APNs 키 발급 + Expo 등록 | Key ID: 87D478WPVU |
| iOS Preview 빌드 + 아이패드 실기기 테스트 | |
| iOS 푸시 알림 실기기 확인 | |
| 개인정보처리방침 / 약관 URL 연결 | `https://sahan.dothome.co.kr/bbs/content.php?co_id=privacy` |
| Push Token UI 제거 (보안) | explore.tsx |

---

## 🔴 지금 당장 — Production 빌드

```bash
# 둘 다 동시에 실행 가능
eas build --profile production -p android
eas build --profile production -p ios
```

- [ ] Android Production AAB 빌드
- [ ] iOS Production IPA 빌드

빌드 시간: 각 15~20분

---

## 🟠 빌드 완료 후 — 스토어 제출 준비물

미리 준비해두면 제출이 빠름:

- [ ] 스크린샷: Android 1080×1920 이상 최소 2장 / iOS 1284×2778 최소 3장
- [ ] 앱 짧은 설명 (80자 이내, 한국어)
- [ ] 앱 상세 설명 (4000자 이내, 한국어)

이미 준비된 것:
- 개인정보처리방침 URL: `https://sahan.dothome.co.kr/bbs/content.php?co_id=privacy` ✅
- 권한 사유: 알림 → "공지사항 및 업데이트 알림 수신용" ✅

---

## 🟠 Android 제출

- [ ] Play Console 앱 등록 + AAB 업로드
- [ ] 스크린샷 / 설명 입력
- [ ] 심사 제출
- [ ] 심사 대기 (1~3일) → 🟢 Android 출시

---

## 🟠 iOS 제출

- [ ] App Store Connect 앱 등록
- [ ] IPA 업로드 (`eas submit -p ios` 또는 Transporter)
- [ ] 스크린샷 / 설명 입력
- [ ] 심사 제출
- [ ] 심사 대기 (1~3일) → 🟢 iOS 출시

---

## 🔵 출시 후 — 웹 작업

- [ ] 웹 메인페이지 영상으로 제작 및 디테일 수정

---

## ⚪ 선택 / 정리성 작업 (언제든 시간 날 때)

- [ ] `.expo` git 추적 제거: `git rm -r --cached .expo`
- [ ] `expo lint` React Compiler 경고 정리
- [ ] Node.js LTS 업그레이드 (현재 v20.11.0 → 권장 ≥20.19.4)

---

## 남은 일정 (2026-10-09 기준)

| 날짜 | 작업 |
|------|------|
| **10/09 (오늘)** | Production 빌드 시작 (Android + iOS 동시) + 스크린샷/설명 준비 |
| **10/10 (토)** | 빌드 완료 → Play Console + App Store Connect 제출 |
| **10/11~13** | 심사 대기 (1~3일) |
| **10/13~14 (화~수)** | 🟢 Android + iOS 동시 출시 (심사 통과 시) |
| **출시 후** | 웹 메인페이지 영상 제작 및 디테일 수정 |
