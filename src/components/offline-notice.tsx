import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
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
      {/* 상단 여백으로 콘텐츠를 아래쪽에 배치 (msg_wrap .empty_list: padding-top 41.667vw) */}
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/ico_offline.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          인터넷 연결 상태가 좋지 않습니다
        </Text>
        <Text style={styles.description}>
          잠시 후 다시 시도해주세요.
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
    // padding-top: 41.667vw 기준 → 화면 높이의 ~42% 상단 여백으로 아래쪽 배치
    paddingTop: '50%',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    // width: 11.111vw 기준 → 화면 너비의 ~11%
    width: '11%',
    aspectRatio: 1,
  },
  title: {
    // font-size: 4.444vw, color: #4A5362, line-height: 1.5
    marginTop: 32,
    fontSize: 18,
    lineHeight: 24,
    color: '#4A5362',
    textAlign: 'center',
  },
  description: {
    // font-size: 3.333vw, color: #6E7786, line-height: 1.5
    marginTop: 8,
    fontSize: 14,
    lineHeight: 18,
    color: '#6E7786',
    textAlign: 'center',
  },
  button: {
    marginTop: 40,
    backgroundColor: '#5268A5',
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
