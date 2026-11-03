module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // React Navigation options like `headerRight: () => <Button />` are render
    // callbacks, not nested component types.
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
  },
};
