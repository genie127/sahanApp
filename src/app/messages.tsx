import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AppWebView, { type AppWebViewHandle } from '@/components/app-webview';
import { OfflineNotice } from '@/components/offline-notice';
import { WEB_URL } from '@/constants/config';
import { getAuthState, subscribeAuthState } from '@/hooks/use-auth-state';
import { useNetworkStatus } from '@/hooks/use-network-status';

export default function MessagesScreen() {
  const webViewRef = useRef<AppWebViewHandle>(null);
  const { isOffline } = useNetworkStatus();

  const [isMember, setIsMember] = useState(() => getAuthState().isMember);

  useEffect(() => {
    // 마운트 전에 이미 auth가 들어온 경우 동기화
    setIsMember(getAuthState().isMember);
    return subscribeAuthState((s) => setIsMember(s.isMember));
  }, []);

  const messagesUrl = `${WEB_URL}/bbs/board.php?bo_table=messages&type=${isMember ? 'mine' : 'all'}`;

  const handleRetry = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  if (isOffline) {
    return <OfflineNotice onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      {/* key가 바뀌면 웹뷰가 재마운트 → 새 URL로 로드 */}
      <AppWebView
        key={messagesUrl}
        ref={webViewRef}
        initialUrl={messagesUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
