/**
 * useAppLinks — 웹 서버(관리자 DB)에서 앱 내 링크를 가져와 반환
 *
 * 우선순위:
 *  1. 서버 fetch 성공 → 서버 값 사용 + 캐시 갱신
 *  2. 서버 fetch 실패(오프라인 등) → AsyncStorage 캐시 사용
 *  3. 캐시도 없으면 → FALLBACK_LINKS(하드코딩 기본값) 사용
 *
 * 서버 API 응답 형식 (app-links.php):
 * {
 *   "error_report": "https://docs.google.com/spreadsheets/d/..."
 * }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { APP_LINKS_URL } from '@/constants/config';

// ─── 타입 ─────────────────────────────────────────────────────────────────
export type AppLinks = {
  error_report: string;
};

// ─── 기본값 (서버 fetch + 캐시 모두 실패 시 사용) ─────────────────────────
const FALLBACK_LINKS: AppLinks = {
  error_report: 'https://docs.google.com/spreadsheets/d/1cBSpczog56aoJrTY2lAsbIcJV3YdtQGE-nmD2TKsC1w/edit?gid=0#gid=0',
};

const CACHE_KEY = '@app_links_cache';

// ─── 파싱 ─────────────────────────────────────────────────────────────────
function parseResponse(data: unknown): AppLinks | null {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (typeof d.error_report === 'string' && d.error_report) {
      return { error_report: d.error_report };
    }
  }
  return null;
}

// ─── 훅 ──────────────────────────────────────────────────────────────────
export function useAppLinks(): AppLinks {
  const [links, setLinks] = useState<AppLinks>(FALLBACK_LINKS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. 서버에서 최신값 fetch (항상 먼저 시도)
      try {
        const res = await fetch(APP_LINKS_URL, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        const parsed = parseResponse(data);

        if (parsed) {
          if (!cancelled) setLinks(parsed);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          return;
        } else if (__DEV__) {
          console.warn('[useAppLinks] 응답 파싱 실패:', data);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[useAppLinks] fetch 실패, 캐시 시도:', err);
        }
      }

      // 2. fetch 실패 시에만 캐시 사용
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          const parsed = parseResponse(JSON.parse(cached));
          if (parsed) setLinks(parsed);
        }
      } catch {
        // 캐시도 실패 → 초기 FALLBACK_LINKS 유지
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return links;
}
