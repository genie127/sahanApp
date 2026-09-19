/**
 * CSS / CSS Module import 타입 선언
 *
 * Metro 번들러가 실제 처리하지만 tsc(타입체크)는 이 파일을 모른다.
 * 아래 선언으로 CSS import 시 타입 에러를 방지한다.
 */

// 전역 CSS (side-effect import)
declare module '*.css';

// CSS Modules (클래스명 매핑 객체 반환)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
