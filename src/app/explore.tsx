import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIVACY_POLICY_URL, TERMS_URL, WEB_URL } from '@/constants/config';
import { getAuthState, subscribeAuthState } from '@/hooks/use-auth-state';
import { getWebViewHandle } from '@/hooks/use-webview-registry';

// expo-notifications는 Expo Go(SDK 53+)에서 직접 import 시 크래시 → dynamic require
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}
const Notifications = getNotifications();

// ─── 웹 시안 색상 (그대로) ─────────────────────────────────────────────────
const C = {
  accent: '#5268A5',
  text: '#2F3744',
  sub: '#9AA3B2',
  border: '#E3E7EF',
  bg: '#FFFFFF',
  toggleOff: '#E3E7EF',
  toggleThumb: '#FEFEFB',
  arrBorder: '#93A2CB',
};

// ─── 로고 (logo.png 없을 때를 대비해 텍스트로 대체) ──────────────────────
function LogoImage() {
  try {
    // logo.png 가 있으면 이미지로, 없으면 텍스트로 fallback
     
    const src = require('@/assets/images/logo.png');
    return (
      <RNImage
        source={src}
        style={styles.logoImg}
        resizeMode="contain"
      />
    );
  } catch {
    return (
      <Text style={styles.logoText}>SAHAN</Text>
    );
  }
}

// ─── 커스텀 토글 ──────────────────────────────────────────────────────────
// 웹: width 100px / height 48px / thumb 38px, left 10px
// → 앱: width 52 / height 26 / thumb 20px, left 4px (비율 동일)
function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

// ─── 화살표 (.arr:after — border rotate 45deg) ────────────────────────────
function Arr() {
  return (
    <View style={styles.arrWrap}>
      <View style={styles.arrChevron} />
    </View>
  );
}

// ─── 항목 사이 구분선 ─────────────────────────────────────────────────────
function Divider() {
  return <View style={styles.divider} />;
}

// ─── 메인 화면 ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  // 로그인 상태 — 마운트 전 auth 이미 들어온 경우도 커버
  const [authState, setAuthStateLocal] = useState(() => getAuthState());
  useEffect(() => {
    setAuthStateLocal(getAuthState());
    return subscribeAuthState((state) => setAuthStateLocal(state));
  }, []);

  // 웹뷰(홈 탭)에서 URL 열기 — 같은 도메인 링크에 사용
  const openInWebView = useCallback((url: string) => {
    router.navigate('/');
    setTimeout(() => {
      const handle = getWebViewHandle();
      handle?.navigateTo(url);
    }, 300);
  }, [router]);

  // 다크모드 대응
  const bg          = isDark ? '#0E1117' : C.bg;
  const textColor   = isDark ? '#E8ECF4' : C.text;
  const subColor    = isDark ? '#8A93A6' : C.sub;
  const borderColor = isDark ? '#2A2D35' : C.border;

  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const refreshPermission = useCallback(async () => {
    if (!Notifications) { setNotificationEnabled(false); return; }
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationEnabled(status === 'granted');
  }, []);

  useEffect(() => { refreshPermission(); }, [refreshPermission]);

  const handleToggleNotification = useCallback(async () => {
    if (!Notifications) {
      Alert.alert('안내', '이 환경에서는 알림 기능을 사용할 수 없습니다.');
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      Alert.alert('알림 끄기', '알림을 끄려면 기기 설정에서 변경해 주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert('알림 권한 필요', '설정에서 권한을 허용해 주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]);
    }
    refreshPermission();
  }, [refreshPermission]);

  const openLink = useCallback((url: string) => {
    // 외부 링크(x.com 등)는 시스템 브라우저로 열기
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleClearCache = useCallback(() => {
    Alert.alert('캐시 삭제', '저장된 웹 데이터와 캐시를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const handle = getWebViewHandle();
          if (handle) {
            handle.clearCache();
            Alert.alert('완료', '캐시를 삭제했어요.');
          } else {
            Alert.alert('안내', '홈 화면을 한 번 연 뒤 다시 시도해 주세요.');
          }
        },
      },
    ]);
  }, []);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]} edges={['top']}>
      {/*
      // ── sub_header: 뒤로가기 + 제목 ──
      <View style={[styles.subHeader, { borderBottomColor: borderColor }]}>
        <Pressable style={styles.backBtn} hitSlop={16}>
          <View style={styles.backChevron} />
        </Pressable>
        <Text style={[styles.subHeaderTitle, { color: textColor }]}>설정</Text>
      </View>
        */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── 로고 ── */}
        <View style={styles.logoWrap}>
          <LogoImage />
        </View>

        <View style={styles.pageTit}>
          <Text style={[styles.pageTitText, { color: C.accent }]}>Settings</Text>
        </View>

        {/* ────────────────────────────────────────────────────
            첫 번째 wrap_setli — 로그인/회원가입
            padding: 0 40px → 좌우 20, margin-top 60px → 30
        ──────────────────────────────────────────────────── */}
        <View style={[styles.setliWrap, { borderBottomColor: borderColor }]}>
          {/* li: 로그인/회원가입 ↔ 회원 아이디 + 로그아웃 */}
          {authState.isMember ? (
            <>
              {/* 로그인 상태: 아이디 님 → 회원정보 수정 */}
              <Pressable
                style={({ pressed }) => [styles.li, pressed && styles.liPressed]}
                onPress={() => openInWebView(
                  `${WEB_URL}/bbs/member_confirm.php?url=register_form.php`
                )}>
                <Text style={[styles.liText, { color: textColor }]}>
                  <Text style={{ color: C.accent }}>{authState.memberId}</Text> 님
                </Text>
                <Arr />
              </Pressable>
              {/* 로그아웃 */}
              <Pressable
                style={({ pressed }) => [styles.li, styles.liRight, pressed && styles.liPressed]}
                onPress={() => openInWebView(`${WEB_URL}/bbs/logout.php`)}>
                <Text style={[styles.rightLink, { color: subColor }]}>로그아웃</Text>
              </Pressable>
            </>
          ) : (
            /* 비로그인 상태: 로그인/회원가입 */
            <Pressable
              style={({ pressed }) => [styles.li, pressed && styles.liPressed]}
              onPress={() => openInWebView(`${WEB_URL}/bbs/login.php`)}>
              <Text style={[styles.liText, { color: textColor }]}>로그인 / 회원가입</Text>
              <Arr />
            </Pressable>
          )}
        </View>

        {/* ────────────────────────────────────────────────────
            두 번째 wrap_setli — 푸시 알림 설정
        ──────────────────────────────────────────────────── */}
        <View style={styles.setliBlock}>
          {/* p 소제목 */}
          <Text style={[styles.blockTitle, { color: subColor }]}>푸시 알림 설정</Text>
          <View style={[styles.setliWrap, { borderBottomColor: borderColor }]}>
            {/* li: 토글 */}
            <View style={styles.li}>
              <Text style={[styles.liText, { color: textColor }]}>사한절 알림 수신 동의</Text>
              <ToggleSwitch value={notificationEnabled} onToggle={handleToggleNotification} />
            </View>
          </View>
        </View>

        {/* ────────────────────────────────────────────────────
            세 번째 wrap_setli — 이용약관
        ──────────────────────────────────────────────────── */}
        <View style={styles.setliBlock}>
          <Text style={[styles.blockTitle, { color: subColor }]}>이용약관</Text>
          <View style={[styles.setliWrap, { borderBottomColor: borderColor }]}>
            <Pressable
              style={({ pressed }) => [styles.li, pressed && styles.liPressed]}
              onPress={() => openInWebView(TERMS_URL)}>
              <Text style={[styles.liText, { color: textColor }]}>이용약관</Text>
              <Arr />
            </Pressable>
            {/* li + li: margin-top 24px → paddingVertical 12씩 */}
            <Pressable
              style={({ pressed }) => [styles.li, pressed && styles.liPressed]}
              onPress={() => openInWebView(PRIVACY_POLICY_URL)}>
              <Text style={[styles.liText, { color: textColor }]}>개인정보처리방침</Text>
              <Arr />
            </Pressable>
          </View>
        </View>

        {/* ────────────────────────────────────────────────────
            네 번째 wrap_setli.app — 앱 버전 + 오류문의
            .app ul { border-bottom: none }
        ──────────────────────────────────────────────────── */}
        <View style={styles.setliBlock}>
          {/* border-bottom 없음 */}
          <View style={styles.setliNoBorder}>
            {/* 앱 버전: a href="javascript:void()" 처럼 비활성 row */}
            <View style={styles.li}>
              <Text style={[styles.liText, { color: textColor }]}>앱 버전</Text>
              <Text style={[styles.verText, { color: subColor }]}>{appVersion}</Text>
            </View>
            {/* li.right: text-align right, font-size 24px, underline */}
            <View style={[styles.li, styles.liRight]}>
              <Pressable
                onPress={() => openLink('https://x.com/b1ack2overs')}
                style={({ pressed }) => [pressed && styles.liPressed]}>
                <Text style={[styles.rightLink, { color: subColor }]}>오류/개선문의</Text>
              </Pressable>
            </View>
            <View style={[styles.li, styles.liRight]}>
              <Pressable
                onPress={handleClearCache}
                style={({ pressed }) => [pressed && styles.liPressed]}>
                <Text style={[styles.rightLink, { color: subColor }]}>캐시 삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // ── sub_header ────────────────────────────────────────────────────────────
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // 웹 sub_header와 동일한 밀도감
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  subHeaderTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3,
  },
  // 웹 .arr_prev — 좌측 뒤로가기 화살표
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.sub,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },

  // ── 로고 ──────────────────────────────────────────────────────────────────
  // 웹 container margin-top: 20px 참고
  logoWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  logoImg: {
    width: 200,
    height: 19,
  },
  pageTit: {
    textAlign: 'left',
    paddingTop: 20,
    paddingBottom: 28,
  },
  pageTitText:{
    fontSize: 42,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: C.accent,
    letterSpacing: 4,
  },

  // ── 스크롤 컨테이너 ─────────────────────────────────────────────────────
  // 웹 #container padding: 0 40px → 앱 좌우 20
  // margin-bottom: 150px → paddingBottom: 75
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 75,
  },

  // ── wrap_setli 블록 (소제목 포함) ─────────────────────────────────────────
  // 웹 .wrap_setli margin-top: 60px → 30
  setliBlock: {
    marginTop: 30,
  },

  // ── p 소제목 ──────────────────────────────────────────────────────────────
  // 웹 font-size: 24px(=12pt), line-height: 1.5, color: #9AA3B2
  // p + ul: margin-top 40px → 20
  blockTitle: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 18,
    marginBottom: 20,
  },

  // ── ul (하단 구분선 있음) ──────────────────────────────────────────────────
  // 웹 padding-bottom: 20px, border-bottom: 1px solid #E3E7EF
  setliWrap: {
    paddingBottom: 10,
    borderBottomWidth: 1,
  },

  // ── ul (구분선 없음, .wrap_setli.app) ─────────────────────────────────────
  setliNoBorder: {
    paddingBottom: 10,
  },

  // ── li row ────────────────────────────────────────────────────────────────
  // 웹 li + li: margin-top 24px → 위아래 paddingVertical 12씩
  li: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  liPressed: {
    opacity: 0.55,
  },

  // li.right
  liRight: {
    justifyContent: 'flex-end',
  },

  // ── li p (항목 텍스트) ────────────────────────────────────────────────────
  // 웹 font-size: 32px(=16pt), font-weight: 500, color: #2F3744
  liText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.2,
  },

  // ── .ver (앱 버전) ────────────────────────────────────────────────────────
  // 웹 font-size: 28px(=14pt), line-height: 1.5
  verText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 21,
  },

  // ── li.right a (오류문의, 캐시삭제) ──────────────────────────────────────
  // 웹 font-size: 24px(=12pt), font-weight: 500, text-decoration: underline, color: #9AA3B2
  rightLink: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    textDecorationLine: 'underline',
  },

  // ── 항목 사이 구분선 ─────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
  },

  // ── .arr (화살표) ─────────────────────────────────────────────────────────
  // 웹 width: 14px, height: 24px
  // :after width/height: 18px, border: 1px solid #93A2CB, rotate(45deg)
  arrWrap: {
    width: 14,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrChevron: {
    width: 9,
    height: 9,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: C.arrBorder,
    transform: [{ rotate: '45deg' }],
  },

  // ── .toggle ───────────────────────────────────────────────────────────────
  // 웹 width:100px / height:48px / radius:24px
  // 앱 비율 유지: width:52 / height:25 / radius:13
  toggle: {
    width: 52,
    height: 25,
    borderRadius: 13,
    backgroundColor: C.toggleOff,
  },
  toggleOn: {
    backgroundColor: C.accent,
  },

  // ── .toggle_btn ───────────────────────────────────────────────────────────
  // 웹 left:10px / width:38px / height:38px
  // 앱 비율: left:5 / width:19 / height:19
  toggleThumb: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.toggleThumb,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 2,
  },
  // .toggle.on .toggle_btn: left: calc(100% - 48px) → 오른쪽
  toggleThumbOn: {
    left: 30,
  },
});
