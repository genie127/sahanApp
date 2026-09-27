import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import AppWebView, { type AppWebViewHandle } from '@/components/app-webview';
import { OfflineNotice } from '@/components/offline-notice';
import { WEB_URL } from '@/constants/config';
import { useNetworkStatus } from '@/hooks/use-network-status';

export default function SahanScreen() {
  const webViewRef = useRef<AppWebViewHandle>(null);
  const { isOffline } = useNetworkStatus();

  const handleRetry = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  if (isOffline) {
    return <OfflineNotice onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <AppWebView ref={webViewRef} initialUrl={`${WEB_URL}/bbs/content.php?co_id=sahan`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
