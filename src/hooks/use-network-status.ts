import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * 네트워크 연결 상태를 실시간으로 반환하는 훅
 *
 * - isConnected: 물리적 네트워크 연결 여부
 * - isInternetReachable: 실제 인터넷 도달 가능 여부 (null이면 판단 전)
 * - isOffline: 오프라인 화면 노출 판단용 (연결 안 됨 확정 시 true)
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    // 초기 상태 1회 조회
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    // 상태 변경 구독
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  // 연결 자체가 끊겼거나, 연결은 됐지만 인터넷 도달이 명확히 불가능한 경우 오프라인 처리
  const isOffline = isConnected === false || isInternetReachable === false;

  return { isConnected, isInternetReachable, isOffline };
}
