/**
 * CustomTabBar — 웹 #gnb 재현
 *
 * HOME(index)  → floating pill, SVG gradient 배경
 * 나머지 4개   → 하단 고정 흰 배경 (sub)
 *               높이 = PILL_H(탭 콘텐츠) + insets.bottom(제스처바)
 *               → 배경이 제스처바까지 채워짐
 * 스크롤 down  → translateY(HIDE_Y) 숨김
 * 스크롤 up    → translateY(0) 표시
 */

import { subscribeTabBarScroll } from '@/hooks/use-tabbar-scroll';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Image,
    ImageSourcePropType,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

// ─── 탭 설정 (웹 HTML 순서) ───────────────────────────────────────────────
const TABS: {
  name: string;
  label: string;
  offImg: ImageSourcePropType;
  subOffImg: ImageSourcePropType;
  onImg: ImageSourcePropType;
}[] = [
  {
    name: 'sahan', label: 'SAHAN',
     
    offImg:    require('@/assets/images/tabIcons/navSahan.png'),
     
    subOffImg: require('@/assets/images/tabIcons/navSubSahan.png'),
     
    onImg:     require('@/assets/images/tabIcons/navSahan_on.png'),
  },
  {
    name: 'messages', label: 'MESSAGES',
     
    offImg:    require('@/assets/images/tabIcons/navMessages.png'),
     
    subOffImg: require('@/assets/images/tabIcons/navSubMessages.png'),
     
    onImg:     require('@/assets/images/tabIcons/navMessages_on.png'),
  },
  {
    name: 'index', label: 'HOME',
     
    offImg:    require('@/assets/images/tabIcons/home.png'),
     
    subOffImg: require('@/assets/images/tabIcons/navSubHome.png'),
     
    onImg:     require('@/assets/images/tabIcons/navHome_on.png'),
  },
  {
    name: 'filmography', label: 'FILMOGRAPHY',
     
    offImg:    require('@/assets/images/tabIcons/navFilmography.png'),
     
    subOffImg: require('@/assets/images/tabIcons/navSubFilmography.png'),
     
    onImg:     require('@/assets/images/tabIcons/navFilmography_on.png'),
  },
  {
    name: 'explore', label: 'SETTINGS',
     
    offImg:    require('@/assets/images/tabIcons/navSettings.png'),
     
    subOffImg: require('@/assets/images/tabIcons/navSubSettings.png'),
     
    onImg:     require('@/assets/images/tabIcons/navSettings_on.png'),
  },
];

// ─── 상수 ─────────────────────────────────────────────────────────────────
const PILL_H  = 65;   // 탭바 높이 (웹 130px ÷ 2)
const PILL_R  = 33;   // pill border-radius (웹 66px ÷ 2)
const SUB_R   = 20;   // sub 상단 radius (웹 40px ÷ 2)
const ICON_SZ = 36;   // 아이콘 크기
const HIDE_Y  = 120;  // 스크롤 다운 시 숨길 Y

const CLR = {
  shadow:  '#5268A5',
  subBg:   '#ffffff',
  subBgDk: '#1C1C1E',
  lblMain: '#ffffff',
  lblSub:  '#5268A5',
  glow:    '#E3E7EF',
} as const;

// ─── SVG gradient 배경 ────────────────────────────────────────────────────
// overflow:visible을 쓰기 위해 pill clip을 SVG Rect의 rx/ry로 직접 처리
// → 아이콘이 pill 위로 삐져나올 수 있음
function PillGradient() {
  return (
    <Svg
      width="100%" height="100%"
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E6EAF6" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#6F86D6" stopOpacity="0.4" />
        </LinearGradient>
      </Defs>
      {/* rx/ry로 pill 모양 직접 그림 — 부모 overflow:visible이어도 배경은 pill 모양 유지 */}
      <Rect x="0" y="0" width="100%" height="100%" rx={PILL_R} ry={PILL_R} fill="url(#g)" />
    </Svg>
  );
}

// ─── 탭 아이템 ────────────────────────────────────────────────────────────
function TabItem({ item, isSub }: {
  item: {
    label: string;
    isActive: boolean;
    imgSrc: ImageSourcePropType;
    onPress: () => void;
    onLongPress: () => void;
  };
  isSub: boolean;
}) {
  // main 모드 active: 아이콘을 위로 올려서 pill 밖으로 삐져나오는 효과
  // 웹 원본에서 active 아이콘이 pill top을 넘어서 보이는 디테일
  const activeOffset = (!isSub && item.isActive) ? -14 : 0;

  return (
    <Pressable
      style={({ pressed }) => [S.item, pressed && S.itemPressed]}
      onPress={item.onPress}
      onLongPress={item.onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: item.isActive }}
      accessibilityLabel={item.label}
    >
      <View style={[
        S.iconWrap,
        isSub && item.isActive && S.iconGlow,
        { marginTop: activeOffset },   // main active: 위로 올림
      ]}>
        <Image source={item.imgSrc} style={S.icon} resizeMode="contain" />
      </View>
      {item.isActive && (
        <Text style={[S.label, { color: isSub ? CLR.lblSub : CLR.lblMain }]} numberOfLines={1}>
          {item.label}
        </Text>
      )}
    </Pressable>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isDark  = useColorScheme() === 'dark';
  const active  = state.routes[state.index]?.name ?? '';
  const isSub   = active !== 'index';

  // 스크롤 hide/show
  const ty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    return subscribeTabBarScroll((dir) => {
      Animated.timing(ty, {
        toValue: dir === 'down' ? HIDE_Y : 0,
        duration: dir === 'down' ? 180 : 240,
        useNativeDriver: true,
      }).start();
    });
  }, [ty]);

  const items = useMemo(() =>
    TABS.map((t) => {
      const route    = state.routes.find((r) => r.name === t.name);
      const isActive = active === t.name;
      const imgSrc   = isActive ? t.onImg : (isSub ? t.subOffImg : t.offImg);

      const onPress = () => {
        if (!route) return;
        const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!isActive && !ev.defaultPrevented) navigation.navigate(route.name);
      };
      const onLongPress = () => {
        if (route) navigation.emit({ type: 'tabLongPress', target: route.key });
      };
      return { ...t, isActive, imgSrc, onPress, onLongPress };
    }),
   
  [state, navigation, active, isSub]);

  // ── SUB 모드 ─────────────────────────────────────────────────────────
  if (isSub) {
    const bg = isDark ? CLR.subBgDk : CLR.subBg;
    // ★ 핵심: 높이를 명시해야 absoluteFill 배경이 제대로 채워짐
    const totalH = PILL_H + insets.bottom;

    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          S.subOuter,
          { height: totalH, transform: [{ translateY: ty }] },
        ]}
      >
        {/* ★ 배경: subOuter 전체(제스처바 포함)를 채우는 흰 박스
            overflow:hidden + borderTopRadius로 위 모서리만 둥글게 */}
        <View style={[S.subBg, { backgroundColor: bg }]} />

        {/* 탭 콘텐츠: PILL_H 고정, 제스처바 위에 표시 */}
        <View style={S.row}>
          {items.map((it) => <TabItem key={it.name} item={it} isSub />)}
        </View>
      </Animated.View>
    );
  }

  // ── MAIN 모드 ─────────────────────────────────────────────────────────
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        S.mainOuter,
        { bottom: 20 + insets.bottom, transform: [{ translateY: ty }] },
      ]}
    >
      <PillGradient />
      <View style={S.row}>
        {items.map((it) => <TabItem key={it.name} item={it} isSub={false} />)}
      </View>
    </Animated.View>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────
const S = StyleSheet.create({

  // SUB outer: 높이는 컴포넌트에서 동적으로 지정 (PILL_H + insets.bottom)
  subOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: CLR.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },

  // SUB 배경: subOuter 전체를 채우고 위쪽만 둥글게
  // overflow:hidden으로 borderRadius 클립
  subBg: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: SUB_R,
    borderTopRightRadius: SUB_R,
    overflow: 'hidden',
  },

  // MAIN outer: floating pill
  // overflow: visible → active 아이콘이 pill 위로 삐져나올 수 있음
  // gradient clip은 SVG Rect의 rx/ry가 담당
  mainOuter: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: PILL_H,
    borderRadius: PILL_R,
    overflow: 'visible',
    shadowColor: CLR.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },

  // 공통 탭 row: PILL_H 높이, 아이콘 중앙 정렬
  row: {
    height: PILL_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPressed: { opacity: 0.6 },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // sub active 글로우 (배경색 없음)
  iconGlow: {
    borderRadius: 999,
    shadowColor: CLR.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  icon: {
    width: ICON_SZ,
    height: ICON_SZ,
  },

  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
