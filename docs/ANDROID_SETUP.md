# 안드로이드 개발 환경 세팅 가이드 (Windows)

> 이 앱(React Native 웹뷰앱)을 **Android Studio + 실기기**로 실행/확인하기 위한 세팅 문서.
> 집/회사 어디서든 이 순서대로 따라 하면 됩니다.

## 왜 이 방식인가 (B안: Android Studio)

- 이 앱은 `react-native-webview`, `expo-notifications`(네이티브 코드), `NativeTabs`(네이티브 탭)를 사용
- 따라서 **Expo Go 앱으로는 실행 불가** → 개발 빌드(Development Build)가 필요
- 웹 브라우저 미리보기도 불가 (NativeTabs가 순수 네이티브 컴포넌트라서)
- Android Studio를 깔면 에뮬레이터 + 로컬 빌드 + 실시간 코드 반영(Fast Refresh)이 모두 가능

## 사전 확인된 환경 (2026-09-19 기준)

| 도구 | 상태 |
|------|------|
| Node.js | ✅ v22.13.0 설치됨 |
| npm / npx | ✅ 10.9.2 설치됨 |
| JDK (java) | ❌ 미설치 → 1단계 필요 |
| Android SDK (adb) | ❌ 미설치 → 2단계 필요 |

---

## 0단계. Node.js 설치 (집 PC 등 새 환경일 때만)

이미 설치돼 있으면 건너뛰어도 됨. 확인:
```powershell
node -v
```
버전이 안 뜨면 https://nodejs.org 에서 **LTS 버전** 설치 (설치 시 npm/npx도 함께 설치됨).
설치 후 터미널 재시작 후 다시 `node -v` 확인.

---

## 1단계. JDK 17 설치

Expo SDK 54+ 는 **JDK 17** 권장.

- **방법 A (간단):** PowerShell에서
  ```powershell
  winget install Microsoft.OpenJDK.17
  ```
- **방법 B:** https://adoptium.net/ 에서 Temurin 17 `.msi` 다운로드 후 설치

> ⚠️ 설치 후 **터미널(또는 Kiro)을 완전히 껐다 켜야** `java` 명령이 인식됨.

확인:
```powershell
java -version
```

---

## 2단계. Android Studio 설치

1. https://developer.android.com/studio 에서 다운로드 후 설치
2. 설치 마법사에서 **"Standard"** 선택 → 아래가 자동 설치됨
   - Android SDK
   - Android SDK Platform-Tools (`adb` 포함)
   - Android Emulator

---

## 3단계. 환경변수 설정 (중요)

Expo가 안드로이드 SDK를 찾으려면 `ANDROID_HOME` 필요.
Android Studio 설치 후 PowerShell에서:

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx Path "$env:Path;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

> ⚠️ 실행 후 **터미널 재시작** 필요.

확인:
```powershell
adb version
```

---

## 4단계. 안드로이드 폰 연결 (실기기 추천)

> 푸시 알림 토큰은 **실기기에서만** 발급되므로 실기기 사용 권장.

1. 폰: **설정 → 휴대전화 정보 → 빌드 번호 7번 탭** → 개발자 옵션 활성화
2. **개발자 옵션 → USB 디버깅 켜기**
3. USB로 PC 연결 → 폰에 뜨는 "USB 디버깅 허용?" → **허용**

확인 (기기가 목록에 뜨면 성공):
```powershell
adb devices
```

### (대안) 에뮬레이터 사용 시
- Android Studio → More Actions → Virtual Device Manager → 기기 생성 후 실행
- 단, 에뮬레이터에서는 푸시 토큰 발급 불가 (나머지 화면/웹뷰/설정/오프라인은 확인 가능)

---

## 5단계. 첫 실행

프로젝트 폴더(`sahan`)에서:
```powershell
npx expo run:android
```

- 처음엔 네이티브 빌드라 몇 분 소요
- 완료되면 폰/에뮬레이터에 앱 설치 + 자동 실행
- 이후 코드 수정 시 화면에 바로 반영됨 (Fast Refresh)

---

## 최종 체크리스트

- [ ] `java -version` → 17 버전 출력
- [ ] `adb version` → 정상 출력
- [ ] `adb devices` → 폰/에뮬레이터가 목록에 표시
- [ ] `npx expo run:android` → 앱 설치 및 실행 성공

---

## 앞으로 남은 개발 작업 (참고)

세팅 완료 후 이어서 할 일. 자세한 현황은 `PROJECT_PLAN.md` 참고.

| 작업 | 상태 |
|------|------|
| 딥링크 URL→화면 매핑 (`sahan://open?url=...`) | 🟡 미구현 |
| EAS projectId 연결 (`eas init`) → 푸시 토큰 활성화 | 🟡 미완 |
| 실기기 테스트 → Android 빌드 → Play Store 출시 | ⬜ 대기 |

---

# iOS(아이폰) 테스트 방법

> 현재 맥북 없음 → 추석에 맥북 확보 예정. 상황별로 3가지 경로가 있음.
> (조사 기준: 2026-09-19, Expo 공식 문서/블로그)

## 핵심 요약

- **맥북 없어도 iOS 빌드/테스트 가능하다.** EAS Build가 Expo의 Mac 서버에서 대신 빌드해줌.
- 단, iOS는 **Apple Developer 계정(연 $99)** 이 반드시 필요함. (Android의 Play Console은 1회 $25)
- 아이폰 실기기 테스트는 **기기 UDID를 미리 등록**해야 설치 가능 (Ad Hoc 방식).

## 방법 1. EAS Build로 아이폰 실기기 테스트 (맥북 없이, 지금 가능) ⭐

맥북이 없는 지금 단계에서 아이폰에 직접 올려보는 방법.

```powershell
# 1) EAS CLI 설치 & 로그인
npm install -g eas-cli
eas login

# 2) 테스트할 아이폰 UDID 등록 (안내 QR/링크로 기기 등록)
eas device:create

# 3) 내부 배포용 iOS 빌드 (클라우드 = 맥북 불필요)
eas build -p ios --profile preview
```

- Apple 계정 로그인 및 인증서 생성은 EAS가 대화형으로 안내해줌
- 빌드 완료 후 나오는 링크를 **등록한 아이폰**에서 열면 설치됨
- ⚠️ `preview` 프로필은 `eas.json`에 iOS용 설정 추가 필요할 수 있음 (아래 참고)

## 방법 2. EAS Simulator (클라우드 iOS 시뮬레이터, 브라우저 확인)

2026년 나온 신규 서비스. 클라우드의 iOS 시뮬레이터를 **브라우저 탭**으로 띄워서 확인.
Windows에서도 아이폰 화면을 보고 Fast Refresh(코드 실시간 반영)까지 가능.

- 장점: 아이폰 실기기 없이도 화면 확인 가능, 팀과 URL 공유 가능
- 단점: **아직 대기자 명단(waitlist) 기반 제한적 프리뷰** → 신청 후 승인 필요
- 신청: https://expo.dev/services/simulators
- 문서: https://docs.expo.dev/preview/eas-simulator/introduction/

## 방법 3. 맥북 확보 후 (추석 이후, 정석)

맥북이 생기면 안드로이드와 똑같은 흐름으로 개발 가능.

```bash
# Xcode 설치(App Store) 후
npx expo run:ios          # 로컬 시뮬레이터 실행
```

- 로컬 iOS 시뮬레이터 + Fast Refresh로 가장 쾌적
- App Store 출시도 `eas build -p ios` → `eas submit -p ios` 로 진행

## iOS 관련 주의사항

- **⚠️ SDK 57 + Xcode 버전 이슈**: SDK 57은 Xcode 26을 요구한다는 보고가 있음. EAS 클라우드 빌드가 `UNSUPPORTED_XCODE` 에러를 내면, Expo 빌드 인프라 업데이트를 기다리거나 임시로 SDK를 낮추는 방법이 거론됨. 실제 빌드 시 에러 메시지 확인 후 대응.
- **딥링크(Universal Link)**: 실도메인 연결 후 `apple-app-site-association` 파일 배포 필요 (현재는 커스텀 스킴 `sahan://`만 사용).
- **푸시 알림(APNs)**: iOS 푸시는 Apple Push Notification 인증서가 필요하지만, Expo Push 서비스가 대행하므로 별도 서버 세팅은 불필요.

## iOS 최종 체크리스트

- [ ] Apple Developer 계정($99/년) 준비
- [ ] `eas login` 완료
- [ ] `eas device:create`로 테스트 아이폰 UDID 등록
- [ ] `eas build -p ios --profile preview` 빌드 성공
- [ ] 아이폰에서 설치 링크 열어 앱 실행 확인

---

## 참고: 트러블슈팅

- **한글 폴더명 크래시**: 경로에 한글이 있으면 빌드가 깨질 수 있음 → 현재 `genie/sahan` 영문 경로로 이동 완료 (해결됨)
- `java`/`adb`가 계속 인식 안 되면: 환경변수 등록 후 **터미널/Kiro 재시작** 했는지 확인
- 빌드 실패 시: `npx expo run:android` 로그의 첫 번째 에러 메시지 확인
