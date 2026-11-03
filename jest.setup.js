/* eslint-env jest */
// MMKV is a native (Nitro) module; give tests an in-memory stand-in.
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const map = new Map();
    return {
      getString: key => map.get(key),
      set: (key, value) => map.set(key, value),
      remove: key => map.delete(key),
      clearAll: () => map.clear(),
    };
  },
}));

// Fixed insets so screens using useSafeAreaInsets render without a provider.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
