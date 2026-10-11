/**
 * useTabLabels — 웹 서버(관리자 DB)에서 탭 메뉴명을 가져와 반환
 *
 * 우선순위:
 *  1. 서버 fetch 성공 → 서버 값 사용 + 캐시 갱신
 *  2. 서버 fetch 실패(오프라인 등) → AsyncStorage 캐시 사용
 *  3. 캐시도 없으면 → FALLBACK_LABELS(하드코딩 기본값) 사용
 *
 * fetch가 끝날 때까지는 캐시(또는 기본값)를 임시로 보여주고,
 * fetch 완료 시 즉시 교체하여 항상 서버 최신값으로 동기화됩니다.
 *
 * 서버 API 응답 형식 (tab-labels.php):
 * [
 *   { "name": "sahan",    "label": "SAHAN"    },
 *   { "name": "messages", "label": "MESSAGES" },
 *   { "name": "index",    "label": "HOME"     },
 *   { "name": "history",  "label": "HISTORY"  },
 *   { "name": "explore",  "label": "SETTINGS" }
 * ]
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { TAB_LABELS_URL } from '@/constants/config';

// ─── 타입 ─────────────────────────────────────────────────────────────────
export type TabLabelMap = {
  sahan:    string;
  messages: string;
  index:    string;
  history:  string;
  explore:  string;
};

type TabLabelItem = { name: string; label: string; link?: string; target?: string };

// ─── 기본값 ───────────────────────────────────────────────────────────────
const FALLBACK_LABELS: TabLabelMap = {
  sahan:    'SAHAN',
  messages: 'MESSAGES',
  index:    'HOME',
  history:  'HISTORY',
  explore:  'SETTINGS',
};

const CACHE_KEY = '@tab_labels_cache';
const KNOWN_NAMES = Object.keys(FALLBACK_LABELS) as (keyof TabLabelMap)[];

// ─── link에서 라우트명 추출 ("/bbs/board.php?bo_table=filmo" → 알 수 없음, "/" → "index" 등)
// 서버가 name을 대문자로 내려주는 경우 label 값과 동일하므로 소문자 비교로 보완
function resolveRouteName(item: TabLabelItem): keyof TabLabelMap | null {
  // 1순위: name 필드가 이미 소문자 라우트명인 경우 ("sahan", "index" 등)
  const nameLower = item.name?.toLowerCase() as keyof TabLabelMap;
  if (KNOWN_NAMES.includes(nameLower)) return nameLower;

  // 2순위: label 소문자를 라우트명으로 매핑 ("SAHAN"→"sahan", "HOME"→"index", "SETTINGS"→"explore")
  const labelLower = item.label?.toLowerCase();
  const LABEL_TO_NAME: Record<string, keyof TabLabelMap> = {
    sahan:    'sahan',
    messages: 'messages',
    home:     'index',
    history:  'history',
    settings: 'explore',
  };
  if (labelLower && LABEL_TO_NAME[labelLower]) return LABEL_TO_NAME[labelLower];

  return null;
}

// ─── 파싱 ─────────────────────────────────────────────────────────────────
function parseResponse(data: unknown): TabLabelMap | null {
  // 배열 형태: [{ name, label, ... }, ...]
  if (Array.isArray(data)) {
    const result: Partial<TabLabelMap> = {};
    for (const item of data as TabLabelItem[]) {
      const routeName = resolveRouteName(item);
      if (routeName && typeof item.label === 'string') {
        result[routeName] = item.label;
      }
    }
    if (KNOWN_NAMES.every((k) => result[k])) return result as TabLabelMap;
    return null;
  }
  // 객체 형태 fallback: { sahan: "SAHAN", ... }
  if (data && typeof data === 'object') {
    if (KNOWN_NAMES.every((k) => typeof (data as Record<string, unknown>)[k] === 'string')) {
      return data as TabLabelMap;
    }
  }
  return null;
}

// ─── 훅 ──────────────────────────────────────────────────────────────────
export function useTabLabels(): TabLabelMap {
  const [labels, setLabels] = useState<TabLabelMap>(FALLBACK_LABELS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. 서버에서 최신값 fetch (항상 먼저 시도)
      try {
        const res = await fetch(TAB_LABELS_URL, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        const parsed = parseResponse(data);

        if (parsed) {
          // fetch 성공 → 서버 값으로 즉시 갱신 + 캐시 업데이트
          if (!cancelled) setLabels(parsed);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          return; // 성공했으니 캐시 fallback 불필요
        } else if (__DEV__) {
          console.warn('[useTabLabels] 응답 파싱 실패:', data);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[useTabLabels] fetch 실패, 캐시 시도:', err);
        }
      }

      // 2. fetch 실패 시에만 캐시 사용
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          const parsed = parseResponse(JSON.parse(cached));
          if (parsed) setLabels(parsed);
        }
      } catch {
        // 캐시도 실패 → 초기 FALLBACK_LABELS 유지
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return labels;
}
