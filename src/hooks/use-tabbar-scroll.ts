/**
 * 탭바 스크롤 hide/show 제어
 *
 * 웹 원본 JS:
 *   scrollTop <= 0       → 탭바 원위치 (translateX(-50%))
 *   scrollTop > last     → 탭바 숨김   (translate(-50%, 200%))
 *   scrollTop < last     → 탭바 표시   (translate(-50%, 0))
 *
 * RN에서는 translateX 불필요(절대 위치이므로), translateY만 사용:
 *   스크롤 아래 → translateY(+tabBarHeight) → 숨김
 *   스크롤 위   → translateY(0) → 표시
 *
 * WebView → postMessage → AppWebView.onMessage → setTabBarScrollDir()
 * CustomTabBar → getTabBarScrollDir() subscribe
 */

type ScrollDir = 'up' | 'down' | 'top';
type Listener = (dir: ScrollDir) => void;

let _dir: ScrollDir = 'top';
const _listeners = new Set<Listener>();

export function setTabBarScrollDir(dir: ScrollDir) {
  if (_dir === dir) return;
  _dir = dir;
  _listeners.forEach((fn) => fn(dir));
}

export function getTabBarScrollDir(): ScrollDir {
  return _dir;
}

export function subscribeTabBarScroll(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
