const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// SVG 파일을 react-native-svg-transformer로 처리
config.transformer.babelTransformerPath = require.resolve('./svg-transformer');

// assetExts에서 svg 제거, sourceExts에 svg 추가
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
