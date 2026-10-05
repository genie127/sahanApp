/**
 * AnimatedSplashOverlay
 *
 * 원본 CSS 기준 (https://26sa08ha28n.vercel.app/ 참고):
 *
 * .wrap      : width 96px (모바일 13.333vw)
 * .wave1     : top:50% left:-52px translateY(-50%) width:136px
 *              path: drawLineReverse (140→0→-140) delay 0.4s infinite
 * .wave2     : top:50% right:-52px translateY(-50%) width:136px
 *              path: drawLine (-140→0→140) delay 0s infinite
 * .star      : top:-20px left:50% translate(-50%,-58%) width:32px
 *              animation: down → top:50% (1s, delay 2s, forwards)
 * .h2        : opacity 0→1 (1.2s, delay 2.5s)
 * s/a1/a2/n  : left:50%→각 최종 left, opacity 0→1 (delay 2.5s)
 *   s  : left100  left:50%→-200%  1.2s
 *   a1 : left50   left:50%→-80%   0.8s
 *   a2 : right50  left:50%→180%   0.8s
 *   n  : right100 left:50%→320%   1.2s
 */

import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Path, Svg } from 'react-native-svg';

// ─── 비율/고정 상수 ──────────────────────────────────────────────────────
// 웹 원본은 width:96px 기준, 미디어쿼리에서 13.333vw로 전환
const WRAP_RATIO = (13.333 * 0.8) / 100;  // vw (0.8x scale)

// wave: 웹에서 width:136px 고정 → 모바일 18.889vw
const WAVE_RATIO = 18.889 / 100;

// star: 웹에서 width:32px 고정 → 모바일 4.444vw
const STAR_RATIO = 4.444 / 100;

// wave 위치: 웹에서 left:-52px / right:-52px (고정 px 비율)
// 96px 기준 → 52/96 = 0.5417
const WAVE_SIDE_RATIO = 52 / 96;

// star 초기 top: -20px (wrap 기준 고정 px 비율)
// star 최종 top: 50% of wrap (수직 중앙)
const STAR_TOP_INIT_RATIO = 20 / 96; // 웹 top:-20px / wrap 96px

const DASH = 140;

// ─── Wave SVG ────────────────────────────────────────────────────────────
// wave1: drawLineReverse — 시작 140, 중간 0, 끝 -140, delay 0.4s
// wave2: drawLine        — 시작 -140, 중간 0, 끝 140,  delay 0s
function WaveLine({
  reverse = false,
  delay = 0,
  waveW,
  waveH,
}: {
  reverse?: boolean;
  delay?: number;
  waveW: number;
  waveH: number;
}) {
  const offset = useRef(new Animated.Value(reverse ? DASH : -DASH)).current;
  const [dashOffset, setDashOffset] = useState(reverse ? DASH : -DASH);

  useEffect(() => {
    const id = offset.addListener(({ value }) => setDashOffset(value));
    const anim = Animated.timing(offset, {
      toValue: reverse ? -DASH : DASH,
      duration: 2000,
      delay,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
      offset.removeListener(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Svg width={waveW} height={waveH} viewBox="0 0 68.35 15.5">
      <Path
        d="M68.13,2.55c-10.43-5.11-24.77,.32-38.66,5.6C18.25,12.43,7.63,16.46,.13,14.48"
        fill="none"
        stroke="#d3c6a8"
        strokeMiterlimit={10}
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
    </Svg>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────
export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const { width: screenW } = useWindowDimensions();

  // vw 기반 크기 계산
  const WRAP_W = screenW * WRAP_RATIO;
  const WRAP_H = WRAP_W * (60 / 48);          // 10.svg viewBox 48×60
  const WAVE_W = screenW * WAVE_RATIO;
  const WAVE_H = WAVE_W * (15.5 / 68.35);
  const STAR_W = screenW * STAR_RATIO;
  const STAR_H = STAR_W * (17.44 / 16.09);

  // wave 위치: left:-52px 비율 (wrap 기준)
  const WAVE_SIDE = WRAP_W * WAVE_SIDE_RATIO; // ≈ WRAP_W * 0.5417

  // star 위치
  // 초기: top:-20px (wrap 기준) → top:50% (WRAP_H/2) 로 이동
  // translateY로 처리: 초기값 = -(STAR_TOP_INIT_RATIO * WRAP_W + STAR_H * 0.58)
  // 최종값 = WRAP_H/2 - 초기_absolute_top
  // 웹에서 star 초기 absolute top = -20 - STAR_H*0.58 (transform 포함)
  const starInitTop = -(WRAP_W * STAR_TOP_INIT_RATIO) - STAR_H * 0.58;
  // 최종 top = WRAP_H/2 (50%), transform translateY(-58%) 유지
  // absolute_final_top = WRAP_H/2 - STAR_H*0.58
  const starDelta = (WRAP_H / 2 - STAR_H * 0.5) - starInitTop;

  const starY     = useRef(new Animated.Value(0)).current;   // 0 = 초기, starDelta = 최종
  const hOpacity  = useRef(new Animated.Value(0)).current;
  const sX        = useRef(new Animated.Value(0)).current;
  const a1X       = useRef(new Animated.Value(0)).current;
  const a2X       = useRef(new Animated.Value(0)).current;
  const nX        = useRef(new Animated.Value(0)).current;
  const sOp       = useRef(new Animated.Value(0)).current;
  const a1Op      = useRef(new Animated.Value(0)).current;
  const a2Op      = useRef(new Animated.Value(0)).current;
  const nOp       = useRef(new Animated.Value(0)).current;
  const overlayOp = useRef(new Animated.Value(1)).current;

  const startAnimations = () => {
    // star: 1s duration, 2s delay
    Animated.timing(starY, {
      toValue: starDelta,
      duration: 1000,
      delay: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // h2 opacity: 1.2s, 2.5s delay
    Animated.timing(hOpacity, {
      toValue: 1,
      duration: 1200,
      delay: 2500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // 글자 애니메이션 헬퍼
    // 웹: left:50% → left:XX%  (wrap 기준 %)
    // RN: translateX로 변환 — 출발점(left:50%)에서 각 최종 left% 차이
    //   s  : left:-200% → 출발 50%  → delta = -200 - 50 = -250% of WRAP_W
    //   a1 : left:-80%  → delta = -80  - 50 = -130% of WRAP_W
    //   a2 : left:180%  → delta = 180  - 50 = +130% of WRAP_W
    //   n  : left:320%  → delta = 320  - 50 = +270% of WRAP_W
    const letterAnim = (
      xAnim: Animated.Value,
      opAnim: Animated.Value,
      targetX: number,
      duration: number,
    ) =>
      Animated.parallel([
        Animated.timing(xAnim, {
          toValue: targetX,
          duration,
          delay: 2500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opAnim, {
          toValue: 1,
          duration,
          delay: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]);

    Animated.parallel([
      letterAnim(sX,  sOp,  -(WRAP_W * 2.5), 1200),
      letterAnim(a1X, a1Op, -(WRAP_W * 1.3),  800),
      letterAnim(a2X, a2Op,   WRAP_W * 1.3,   800),
      letterAnim(nX,  nOp,    WRAP_W * 2.7,  1200),
    ]).start();

    // 전체 페이드아웃
    Animated.timing(overlayOp, {
      toValue: 0,
      duration: 600,
      delay: 4200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[S.overlay, { opacity: overlayOp }]}
      onLayout={() => SplashScreen.hideAsync().finally(startAnimations)}>
      {/* 배경 이미지 */}
      <Image
        source={require('@/assets/images/splash-background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View style={{ width: WRAP_W, height: WRAP_H }}>

        {/* wave1: top:50% left:-52px (wrap 기준) translateY(-50%) — drawLineReverse delay 0.4s */}
        <View style={{
          position: 'absolute',
          top: WRAP_H / 2 - WAVE_H / 2,
          left: -WAVE_SIDE,
        }}>
          <WaveLine reverse delay={400} waveW={WAVE_W} waveH={WAVE_H} />
        </View>

        {/* wave2: top:50% right:-52px — drawLine delay 0s */}
        <View style={{
          position: 'absolute',
          top: WRAP_H / 2 - WAVE_H / 2,
          right: -WAVE_SIDE,
        }}>
          <WaveLine waveW={WAVE_W} waveH={WAVE_H} />
        </View>

        {/* 10.svg — H 프레임 */}
        <Image
          source={require('@/assets/images/splash/10.svg')}
          style={{ position: 'absolute', top: 0, left: 0, width: WRAP_W, height: WRAP_H }}
          contentFit="contain"
        />

        {/* h.svg — H 심볼 페이드인 */}
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: hOpacity }}>
          <Image
            source={require('@/assets/images/splash/h.svg')}
            style={{ width: WRAP_W, height: WRAP_H }}
            contentFit="contain"
          />
        </Animated.View>

        {/* star: 초기 top:starInitTop, translateY 애니메이션으로 최종 위치(wrap 수직 중앙)로 이동 */}
        <Animated.View style={{
          position: 'absolute',
          top: starInitTop,
          left: (WRAP_W - STAR_W) / 2,
          transform: [{ translateY: starY }],
        }}>
          <Image
            source={require('@/assets/images/splash/star.svg')}
            style={{ width: STAR_W, height: STAR_H }}
            contentFit="contain"
          />
        </Animated.View>

        {/* 글자들: 중앙(translateX:0) 출발 → 각 방향으로 퍼짐 */}
        <Animated.View style={[S.letter, { width: WRAP_W, height: WRAP_H, opacity: sOp, transform: [{ translateX: sX }] }]}>
          <Image
            source={require('@/assets/images/splash/s.svg')}
            style={{ width: WRAP_W * (45.24 / 48), height: WRAP_H }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View style={[S.letter, { width: WRAP_W, height: WRAP_H, opacity: a1Op, transform: [{ translateX: a1X }] }]}>
          <Image
            source={require('@/assets/images/splash/a1.svg')}
            style={{ width: WRAP_W * (50.96 / 48), height: WRAP_H }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View style={[S.letter, { width: WRAP_W, height: WRAP_H, opacity: a2Op, transform: [{ translateX: a2X }] }]}>
          <Image
            source={require('@/assets/images/splash/a2.svg')}
            style={{ width: WRAP_W * (50.97 / 48), height: WRAP_H }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View style={[S.letter, { width: WRAP_W, height: WRAP_H, opacity: nOp, transform: [{ translateX: nX }] }]}>
          <Image
            source={require('@/assets/images/splash/n.svg')}
            style={{ width: WRAP_W * (49.87 / 48), height: WRAP_H }}
            contentFit="contain"
          />
        </Animated.View>

      </View>
    </Animated.View>
  );
}

/** 탭 아이콘용 (미사용, 하위 호환) */
export function AnimatedIcon() {
  return <View />;
}

const S = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  letter: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
