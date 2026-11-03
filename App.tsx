import { StatusBar } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/api/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/theme';

function App() {
  const { isDark } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
