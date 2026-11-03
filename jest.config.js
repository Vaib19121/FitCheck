module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Same order as Metro's resolver.sourceExts, so a .json that shadows a .ts
  // module breaks tests the same way it breaks the app.
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx', 'node'],
  // These packages ship untranspiled ESM; let babel-jest handle them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-.*|@shopify/flash-list)/)',
  ],
};
