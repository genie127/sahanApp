/**
 * useExploreSections — 설정 화면의 동적 섹션/링크 목록을 서버에서 관리
 *
 * 서버 API 응답 형식 (explore-sections.php):
 * [
 *   {
 *     "id": "privacy",                        // 섹션 고유 ID (변경 금지)
 *     "title": "이용약관 및 개인정보처리방침", // 소제목
 *     "items": [
 *       { "id": "terms",   "label": "이용약관",          "url": "https://..." },
 *       { "id": "privacy", "label": "개인정보처리방침",   "url": "https://..." }
 *     ]
 *   },
 *   {
 *     "id": "personal",
 *     "title": "개인 설정",
 *     "items": [
 *       { "id": "block",   "label": "차단 목록",          "url": "https://..." }
 *     ]
 *   }
 * ]
 *
 * 우선순위:
 *  1. 서버 fetch 성공 → 서버 값 + 캐시 갱신
 *  2. fetch 실패 → AsyncStorage 캐시
 *  3. 캐시도 없으면 → FALLBACK(하드코딩 기본값)
 *
 * auth_required = true 인 섹션은 로그인한 회원에게만 노출됩니다.
 * 노출 여부 필터링은 이 훅이 아니라 호출부(explore.tsx)에서 authState 기준으로 처리합니다.
 * 이 훅은 데이터만 반환하여 캐시 일관성을 유지합니다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { BLOCK_URL, EXPLORE_SECTIONS_URL, PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/config';

// ─── 타입 ─────────────────────────────────────────────────────────────────
export type SectionItem = {
  id: string;
  label: string;
  url: string;
};

export type ExploreSection = {
  id: string;
  title: string;
  /** true면 로그인한 회원에게만 노출 (서버의 auth_required와 매핑) */
  authRequired?: boolean;
  items: SectionItem[];
};

// ─── 기본값 (서버 fetch + 캐시 모두 실패 시) ──────────────────────────────
const FALLBACK_SECTIONS: ExploreSection[] = [
  {
    id: 'personal',
    title: '개인 설정',
    authRequired: true,
    items: [
      { id: 'block', label: '차단 목록', url: BLOCK_URL },
    ],
  },
  {
    id: 'privacy',
    title: '이용약관 및 개인정보처리방침',
    items: [
      { id: 'terms',   label: '이용약관',          url: TERMS_URL },
      { id: 'privacy', label: '개인정보처리방침',   url: PRIVACY_POLICY_URL },
    ],
  },
];

const CACHE_KEY = '@explore_sections_cache';

// ─── 파싱 ─────────────────────────────────────────────────────────────────
function parseResponse(data: unknown): ExploreSection[] | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const sections: ExploreSection[] = [];
  for (const s of data) {
    if (
      s &&
      typeof s === 'object' &&
      typeof s.id === 'string' &&
      typeof s.title === 'string' &&
      Array.isArray(s.items)
    ) {
      const items: SectionItem[] = [];
      for (const it of s.items) {
        if (
          it &&
          typeof it === 'object' &&
          typeof it.id === 'string' &&
          typeof it.label === 'string' &&
          typeof it.url === 'string'
        ) {
          items.push({ id: it.id, label: it.label, url: it.url });
        }
      }
      if (items.length > 0) {
        // auth_required는 선택 필드.
        // 서버에서 명시적으로 true를 내려주면 그것을 사용하고,
        // 서버 응답에 없으면 FALLBACK_SECTIONS의 authRequired를 참조해 보전한다.
        let authRequired: true | undefined;
        if ('auth_required' in s && (s as { auth_required?: unknown }).auth_required === true) {
          authRequired = true;
        } else {
          const fallback = FALLBACK_SECTIONS.find((f) => f.id === s.id);
          if (fallback?.authRequired === true) {
            authRequired = true;
          }
        }
        sections.push({
          id: s.id,
          title: s.title,
          ...(authRequired !== undefined ? { authRequired } : {}),
          items,
        });
      }
    }
  }
  return sections.length > 0 ? sections : null;
}

// ─── 훅 ──────────────────────────────────────────────────────────────────
export function useExploreSections(): ExploreSection[] {
  const [sections, setSections] = useState<ExploreSection[]>(FALLBACK_SECTIONS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. 서버에서 최신값 fetch
      try {
        const res = await fetch(EXPLORE_SECTIONS_URL, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        const parsed = parseResponse(data);

        if (parsed) {
          if (!cancelled) setSections(parsed);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          return;
        } else if (__DEV__) {
          console.warn('[useExploreSections] 응답 파싱 실패:', data);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[useExploreSections] fetch 실패, 캐시 시도:', err);
        }
      }

      // 2. fetch 실패 시 캐시 사용
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          const parsed = parseResponse(JSON.parse(cached));
          if (parsed) setSections(parsed);
        }
      } catch {
        // 캐시도 실패 → FALLBACK 유지
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return sections;
}
