module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root:['./'],
          alias: {
            '@': './src',
            '@assets': './assets',
            '@components': './src/components',
            '@screens': './src/screens',
            '@features': './src/features',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@types': './src/types',
            '@configs': './src/configs',
            '@navigation': './src/navigation',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};