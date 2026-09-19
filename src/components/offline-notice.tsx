import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

type Props = {
  /** "다시 시도" 버튼 클릭 시 콜백 */
  onRetry: () => void;
};

/**
 * 오프라인 상태 전용 화면
 * 네트워크가 끊겼을 때 백지/에러 대신 노출한다. (앱 심사 대응)
 */
export function OfflineNotice({ onRetry }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📡</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          인터넷 연결이 없어요
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          네트워크 상태를 확인한 뒤{'\n'}다시 시도해 주세요.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onRetry}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#208AEF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
