import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateScreen } from '../screens/CreateScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { navigationThemes, useTheme } from '../theme';
import { BottomTabs } from './BottomTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer
      theme={isDark ? navigationThemes.dark : navigationThemes.light}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        {/* Pushed screens keep the header, so they get a back button. */}
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="Create"
          component={CreateScreen}
          options={{ presentation: 'modal', title: 'New item' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
