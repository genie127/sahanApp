# React Native 웹뷰앱 개발 계획서 (초안)

## 1. 프로젝트 개요

- **목표**: 서버에 배포된 웹(링크)을 감싸는 React Native 웹뷰(WebView) 앱 개발
- **1차 목표**: Android 앱 출시
- **2차 목표**: 추석 이후 맥북 확보 시 iOS 대응
- **핵심**: 단순 웹뷰가 아니라 **앱 심사 기준을 통과할 수 있는 네이티브 기능**을 갖춘 앱

### 앱 심사 통과를 위해 구현할 기능

| 번호 | 기능 | 목적 |
|------|------|------|
| 1 | 푸시 알림 (Push Notification) | 네이티브 앱다운 재참여 유도, 심사 시 "웹사이트 껍데기"라는 리젝 방지 |
| 2 | 설정 화면 UI | 알림 on/off, 캐시 삭제, 버전 정보 등 네이티브 화면 제공 |
| 3 | 오프라인 화면 | 네트워크 끊김 시 전용 화면 노출 (백지/에러 화면 방지) |
| 4 | 네비게이션 바 | 앱 내 화면 전환 구조 (웹뷰 / 설정 등) |
| 5 | 딥링크 (Deep Link) | 외부 링크로 특정 화면 진입, 심사 시 앱 상호작용 근거 |
| 6 | 스플래시 화면 | 앱 초기 로딩 시 브랜드 노출, 웹 로딩 대기 처리 |

---

## 2. 기술 스택 결정

### 왜 Expo인가? (2026년 기준)

- **Bare React Native는 레거시 리스크**로 평가됨. 2026년 현재 Expo(+EAS)가 사실상 표준
- 필요한 기능이 전부 Expo 공식 라이브러리로 제공됨
  - 푸시 알림: `expo-notifications`
  - 딥링크/네비게이션: `expo-router` 또는 `@react-navigation`
  - 스플래시: `expo-splash-screen`
  - 웹뷰: `react-native-webview`
  - 네트워크 상태: `@react-native-community/netinfo`
- **EAS Build**를 쓰면 **맥북 없이도 클라우드에서 iOS 빌드 가능** → 추석 전이라도 iOS 테스트 가능
- Android는 Windows 환경에서 로컬/클라우드 모두 빌드 가능

### 최종 스택

| 구분 | 선택 |
|------|------|
| 프레임워크 | Expo (SDK 최신 안정 버전) |
| 언어 | TypeScript |
| 라우팅/네비게이션 | Expo Router (파일 기반) |
| 웹뷰 | react-native-webview |
| 푸시 알림 | expo-notifications |
| 오프라인 감지 | @react-native-community/netinfo |
| 스플래시 | expo-splash-screen |
| 빌드/배포 | EAS Build & Submit |

---

## 3. 개발 순서 (무엇부터 할지)

### Phase 0. 환경 준비 (Day 1)
1. Node.js LTS 설치 확인
2. `npx create-expo-app` 로 프로젝트 생성 (TypeScript 템플릿)
3. Android Studio + 에뮬레이터 설치 (또는 실기기 USB 디버깅)
4. Expo 계정 생성 (EAS 사용 목적)
5. Git 연동 및 첫 커밋

### Phase 1. 웹뷰 기본 골격 (Day 1~2)
- `react-native-webview` 설치
- 서버 웹 링크를 로딩하는 기본 화면 구현
- 로딩 인디케이터 처리
- 뒤로가기(Android 하드웨어 백버튼) → 웹뷰 히스토리 back 처리

### Phase 2. 스플래시 화면 (Day 2)
- `expo-splash-screen` 설정
- 앱 로고/브랜드 이미지 등록
- 웹뷰 첫 로딩 완료 시점까지 스플래시 유지 → 자연스러운 전환

### Phase 3. 네비게이션 바 (Day 3)
- Expo Router 하단 탭 구성
  - 홈(웹뷰) 탭
  - 설정 탭
- 필요 시 추가 탭 확장

### Phase 4. 설정 화면 UI (Day 3~4)
- 알림 수신 on/off 토글
- 캐시/데이터 삭제 버튼
- 앱 버전 정보
- 서비스 약관 / 개인정보처리방침 링크 (심사 필수 항목)

### Phase 5. 오프라인 화면 (Day 4)
- `netinfo`로 네트워크 상태 감지
- 오프라인 시 전용 화면 표시 + "다시 시도" 버튼
- 온라인 복귀 시 자동 리로드

### Phase 6. 푸시 알림 (Day 5~6)
- `expo-notifications` 설정
- 알림 권한 요청 흐름
- Expo Push Token 발급
- **전체 공지 알림 전용** → 개인화 없음, Expo Push 서비스로 발송
- 알림 탭 시 앱 열기 / 특정 웹 페이지 이동 처리

### Phase 7. 딥링크 (Day 6)
- 앱 스킴 `sahan://` 설정
- Universal Link / App Link 설정은 실도메인 연결 후 추가
- 특정 URL → 웹뷰 특정 페이지 로딩 매핑

### Phase 8. Android 빌드 & 출시 (Day 7~)
- 앱 아이콘 / 스플래시 에셋 정리
- `eas build -p android` 로 AAB 생성
- Google Play Console 등록 및 심사 제출

### Phase 9. iOS 대응 (추석 이후, 맥북 확보 후)
- Apple Developer 계정 등록
- `eas build -p ios`
- iOS 딥링크(Universal Link) apple-app-site-association 설정
- App Store 심사 제출

---

## 4. 예상 폴더 구조 (Expo Router 기준)

```
sahan/
├── app/                      # Expo Router 라우트
│   ├── _layout.tsx           # 루트 레이아웃 (스플래시, 네비게이션)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # 하단 탭 네비게이션
│   │   ├── index.tsx         # 홈 (웹뷰 화면)
│   │   └── settings.tsx      # 설정 화면
│   └── offline.tsx           # 오프라인 화면
├── components/
│   ├── AppWebView.tsx        # 웹뷰 컴포넌트
│   └── OfflineNotice.tsx     # 오프라인 배너/화면
├── hooks/
│   ├── useNetworkStatus.ts   # 네트워크 상태 훅
│   └── usePushNotification.ts# 푸시 알림 훅
├── constants/
│   └── config.ts             # 웹 URL, 앱 스킴 등 상수
├── assets/                   # 아이콘, 스플래시 이미지
├── app.json                  # Expo 설정 (스킴, 아이콘, 권한)
├── eas.json                  # EAS 빌드 설정
├── package.json
└── tsconfig.json
```

---

## 5. 심사 통과 체크리스트 (참고)

- [ ] 단순 웹뷰가 아닌 네이티브 기능 포함 (푸시/설정/오프라인)
- [ ] 개인정보처리방침 URL 준비 (Play Store / App Store 필수)
- [ ] 앱 아이콘, 스플래시, 스크린샷 준비
- [ ] 권한 사용 사유 명시 (알림 권한 등)
- [ ] 오프라인 시에도 크래시/백지 없이 안내 화면
- [ ] (iOS) Universal Link 도메인 검증 파일 배포

---

## 6. 확정된 프로젝트 설정값

| 항목 | 값 | 비고 |
|------|-----|------|
| 웹 URL (임시) | `https://sahantest.dothome.co.kr` | ⚠️ **임시 서버**. 실도메인 연결 시 `constants/config.ts`의 `WEB_URL`만 교체 |
| 앱 이름 | sahan | |
| 앱 스킴 | `sahan://` | 딥링크용 커스텀 스킴 |
| 유니버설 링크 | 실도메인 연결 후 추가 예정 | 임시서버 단계에서는 커스텀 스킴만 사용 |
| 푸시 알림 | **Expo Push 서비스** | 전체 공지 알림만. 개인화 없음 → 자체 서버 불필요 |
| 개인정보처리방침 | 홈페이지 내 URL 사용 | 정확한 경로 확보 필요 |
| 이용약관 | 홈페이지 내 URL 사용 | 정확한 경로 확보 필요 |

### 추가로 필요한 최종 값 (진행하면서 확보)

1. 개인정보처리방침 / 이용약관 **정확한 URL 경로**
2. 브랜드 로고 / 스플래시 이미지 에셋
3. 최종 패키지명 확정 (실도메인 연결 시 권장, 예: `kr.co.dothome.sahantest`)

---

## 7. 참고: 앱 스킴 / 딥링크 개념

- **앱 스킴** (`sahan://`): `https://` 처럼 내 앱을 여는 전용 주소 접두사. `sahan://event/123` → 앱이 열리고 해당 화면으로 이동. 지금 단계에 사용
- **유니버설/앱링크** (`https://실도메인/...`): 실제 웹주소로 앱/웹 자동 분기, 도메인 인증 파일 필요 → 실도메인 연결 후 추가

## 8. 참고: 푸시 알림 방식 (채택 근거)

- **Expo Push 서비스 채택**: 전체 공지 알림만 필요 → FCM/APNs 인증서 관리를 Expo가 대행하므로 세팅 간단
- 개인화·자동화 알림이 없어 자체 발송 서버 불필요
