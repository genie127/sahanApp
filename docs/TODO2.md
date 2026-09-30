# 남은 할 일 & 예상 일정 (TODO2)

> 작성일: 2026-09-30
> 기준: TODO.md 최신화 + 코드/의존성 점검 결과 반영
>
> **현재 상태 한 줄 요약**
> 앱 코드 골격 완성 + 타입/의존성 정합성 확보 완료.
> 남은 핵심 블로커는 **① 실기기 푸시 검증**, **② 아이콘 에셋 교체** 두 가지.
> 이 둘만 끝나면 곧바로 Android Production 빌드 → 심사 제출 가능.

---

## 0. 지금까지 완료된 것 (참고)

| 구분 | 내용 |
|------|------|
| 앱 기능 | 웹뷰 · 스플래시 · 탭 네비 · 설정화면 · 오프라인화면 · 딥링크 |
| 푸시 코드 | 훅 작성 + 토큰 콘솔 출력(F1) + 서버 등록 골격(F5) |
| 환경 | EAS 연결 · 약관/개인정보 URL · iOS 권한 문구 |
| 정합성 | 타입체크 통과 · 누락 의존성 복구 · SDK 57 버전 정렬 |

---

## 1. 남은 할 일 (블로커 → 후속 순)

### 🔴 블로커 A. 푸시 알림 실기기 검증 (F2)
- 실기기(안드로이드) + Development Build 필수
- 에뮬레이터/Expo Go 불가 (`Device.isDevice` 체크 + SDK 53+ Expo Go 차단)
- 확인 항목
  - [ ] 포그라운드 알림 배너 표시
  - [ ] 백그라운드/종료 상태 알림 수신
  - [ ] 알림 탭 시 앱 열림 + `data.url` 페이지 이동
- 선행: Development Build 1회 필요 (`eas build --profile development -p android`)

### 🔴 블로커 B. 아이콘 에셋 교체 (B2, 디자인 영역)
- 현재 `icon.png` / `android-icon-foreground.png` / `android-icon-monochrome.png` 가
  417x94 비정사각형 → expo-doctor 스키마 검증 실패
- [ ] 정사각형(권장 1024x1024) PNG로 교체
- [ ] 교체 후 `npx expo-doctor`로 스키마 통과 확인

### 🟡 후속 1. Android 알림 아이콘 단색 확인 (F4)
- `assets/images/splash-icon.png`(알림 아이콘 지정됨)가 배경 없는 흰색 단색 PNG인지 확인
- 컬러면 상태바에서 검은 사각형으로 표시됨 → 단색 PNG 별도 준비

### 🟡 후속 2. 스플래시 브랜드 이미지 교체 (B1, 디자인 영역)
- [ ] `assets/images/splash-icon.png` 교체 + `app.json` 확인

### 🟢 정리성 작업 (선택, 빌드 무관)
- [ ] `.expo` git 추적 정리: `git rm -r --cached .expo` (환경에 git 필요)
- [ ] `expo lint` React Compiler 경고 정리 (애니메이션/렌더링 로직, 크래시 아님)
- [ ] Node.js LTS 업그레이드 (현재 v20.11.0 → 권장 ≥20.19.4, 경고 제거용)

---

## 2. 빌드 · 배포 (D 섹션)

| # | 작업 | 명령어 / 비고 | 선행 조건 |
|---|------|--------------|-----------|
| D-dev | Development Build | `eas build --profile development -p android` | - |
| D2 | Production AAB 빌드 | `eas build -p android --profile production` | 블로커 A·B 완료 |
| D3 | Play Console 등록 + 제출 | 스크린샷·설명·권한사유 준비 | D2 완료 |
| D4 | Google 심사 대기 | 1~3일 | D3 완료 |

**D3 제출 시 필요한 것**
- 앱 스크린샷 최소 2장
- 앱 설명 (한국어)
- 개인정보처리방침 URL: `https://sahantest.dothome.co.kr/bbs/content.php?co_id=privacy`
- 권한 사유: 알림 → "공지사항 및 업데이트 알림 수신용"

---

## 3. iOS 출시 (E 섹션, 맥북 확보 후)

| # | 작업 | 비고 | 대기 |
|---|------|------|------|
| E1 | Apple Developer 계정 등록 | 연 $99 | 승인 1~2일 |
| E4 | iOS dev build + 실기기 테스트 | `eas build --profile development -p ios` | - |
| E5 | Universal Link 설정 | 실도메인 확보 후 (현재 블로커) | 도메인 대기 |
| E6 | Production IPA 빌드 | `eas build -p ios --profile production` | - |
| E7 | App Store Connect 등록 + 제출 | - | - |
| E8 | Apple 심사 대기 | - | 1~3일 |

---

## 4. 외부 값 대기 (C 섹션)

| # | 작업 | 상태 |
|---|------|------|
| C3 | 실도메인 확보 후 `WEB_URL` 교체 | 도메인 대기 (한 줄 교체) |
| F5-서버 | 푸시 토큰 저장 서버 엔드포인트 | 준비 후 `PUSH_TOKEN_REGISTER_URL`만 입력 |

---

## 5. 예상 일정

### Android 출시까지 (핵심 경로)

| 시점 | 작업 | 순수 작업 | 대기/심사 |
|------|------|-----------|-----------|
| Day 1 | 아이콘 에셋 교체 (블로커 B) | 1~2시간 | - |
| Day 1 | Development Build | 30분 + 빌드 10~20분 | - |
| Day 1 | F2 실기기 알림 검증 | 30분~1시간 | - |
| Day 1 | F4 알림 아이콘 단색 확인 | 15~30분 | - |
| Day 1~2 | D2 Production AAB 빌드 | 15분 + 빌드 10~20분 | - |
| Day 2 | D3 Play Console 등록 + 제출 | 2~3시간 | - |
| Day 2~5 | D4 Google 심사 대기 | - | 1~3일 |

- **순수 작업량**: 약 1~1.5일 (실기기 있을 때)
- **심사 포함 총 리드타임**: **3~5일**

### iOS 출시까지 (맥북 확보 후)

| 단계 | 작업 | 작업시간 | 대기 |
|------|------|---------|------|
| E1 | Apple 계정 등록 | 30분 | 승인 1~2일 |
| E4 | dev build + 테스트 | 반나절 | - |
| E6~E7 | 빌드 + 제출 | 반나절 | - |
| E8 | 심사 대기 | - | 1~3일 |

- **순수 작업량**: 약 1.5~2일
- **총 리드타임**: **3~6일**

---

## 6. 일정 리스크

1. **실기기 없으면 F2 검증 불가 → Android 전체 정지** (최우선 해소 대상)
2. **심사 대기(1~3일)는 통제 불가** — 반려 시 수정·재제출로 며칠 추가
3. **아이콘 비정사각형** — 교체 안 하면 빌드/심사 단계에서 막힘
4. **실도메인 미확보** — iOS Universal Link(E5)가 대기 상태, Android는 출시 후 `WEB_URL` 교체로 대응 가능
5. **Dev build 필요** — TODO에는 스킵으로 돼 있으나 F2 검증엔 사실상 1회 필수 (반나절 여유 확보)

---

## 7. 권장 진행 순서

```
① 아이콘 에셋 교체 (정사각형)        ← 디자인, 직접
② Development Build → 실기기 설치
③ F2 푸시 알림 검증 (3케이스)
④ F4 알림 아이콘 단색 확인
⑤ D2 Production AAB 빌드
⑥ D3 Play Console 제출
⑦ D4 심사 대기 → 🟢 Android 출시
──────────── (맥북 확보 후) ────────────
⑧ E1 Apple 계정 → E4~E8 → 🟢 iOS 출시
```
