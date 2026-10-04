/**
 * 웹뷰 로그인 상태를 앱 전역에서 공유하는 레지스트리
 *
 * 웹뷰 injectedJS가 그누보드 g5_is_member 값을 postMessage로 전달하면
 * app-webview.tsx의 onMessage에서 setAuthState()를 호출한다.
 * 설정 화면, 메시지 탭 등에서 getAuthState()로 로그인 여부를 읽는다.
 */

type AuthState = {
  isMember: boolean;   // 로그인 여부
  memberId: string;    // 로그인한 아이디 (비로그인 시 '')
};

type Listener = (state: AuthState) => void;

let _state: AuthState = { isMember: false, memberId: '' };
const _listeners = new Set<Listener>();

export function setAuthState(state: AuthState) {
  console.log('📡 setAuthState called:', state.isMember, state.memberId, 'listeners:', _listeners.size);
  if (_state.isMember === state.isMember && _state.memberId === state.memberId) {
    console.log('📡 skipped (same state)');
    return;
  }
  _state = state;
  _listeners.forEach((fn) => fn(_state));
}

export function getAuthState(): AuthState {
  return _state;
}

export function subscribeAuthState(fn: Listener): () => void {
  _listeners.add(fn);
  // 구독 즉시 현재 상태 전달 — 마운트 전에 이미 auth가 들어온 경우 커버
  fn(_state);
  return () => _listeners.delete(fn);
}
