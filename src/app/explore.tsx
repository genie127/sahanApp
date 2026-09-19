import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { getWebViewHandle } from '@/hooks/use-webview-registry';

/**
 * 설정 화면
 *
 * - 알림 수신 on/off (시스템 알림 설정으로 안내)
 * - 이용약관 / 개인정보처리방침 링크 (앱 심사 필수)
 * - 앱 버전 정보
 */
export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 현재 알림 권한 상태 반영
  const refreshPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationEnabled(status === 'granted');
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  // 알림 토글: 권한 요청 또는 시스템 설정으로 이동
  const handleToggleNotification = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      // 이미 허용됨 → 끄려면 시스템 설정에서만 가능하므로 안내
      Alert.alert(
        '알림 끄기',
        '알림을 끄려면 기기의 설정 화면에서 변경해 주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    // 권한 요청
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert(
        '알림 권한 필요',
        '알림을 받으려면 설정에서 권한을 허용해 주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ],
      );
    }
    refreshPermission();
  }, [refreshPermission]);

  const openLink = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url).catch(() => {});
  }, []);

  // 캐시/데이터 삭제: 홈 웹뷰의 캐시를 비우고 재로딩
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: colors.text }]}>설정</Text>

        {/* 알림 섹션 */}
        <Section title="알림" colors={colors}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              공지 알림 받기
            </Text>
            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleNotification}
            />
          </View>
        </Section>

        {/* 약관 섹션 */}
        <Section title="약관 및 정책" colors={colors}>
          <LinkRow
            label="이용약관"
            colors={colors}
            onPress={() => openLink(TERMS_URL)}
          />
          <LinkRow
            label="개인정보처리방침"
            colors={colors}
            onPress={() => openLink(PRIVACY_POLICY_URL)}
          />
        </Section>

        {/* 데이터 섹션 */}
        <Section title="데이터" colors={colors}>
          <LinkRow
            label="캐시 삭제"
            colors={colors}
            onPress={handleClearCache}
          />
        </Section>

        {/* 정보 섹션 */}
        <Section title="정보" colors={colors}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>버전</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {appVersion}
            </Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type Colors =
  (typeof import('@/constants/theme'))['Colors']['light' | 'dark'];

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: Colors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
        {children}
      </View>
    </View>
  );
}

function LinkRow({
  label,
  colors,
  onPress,
}: {
  label: string;
  colors: Colors;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
      onPress={onPress}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowValue: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
});
