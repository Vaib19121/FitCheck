import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { FloatingTabBar } from '../components/FloatingTabBar';
import { renderSafeAreaLayout } from '../components/SafeAreaLayout';
import { ActivityScreen } from '../screens/ActivityScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// [focused, unfocused] Ionicons names.
const TAB_ICONS: Record<keyof BottomTabParamList, [string, string]> = {
  Home: ['home', 'home-outline'],
  Explore: ['compass', 'compass-outline'],
  Activity: ['pulse', 'pulse-outline'],
  Profile: ['person', 'person-outline'],
};

type TabIconProps = { focused: boolean; color: string; size: number };

const renderTabIcon =
  (routeName: keyof BottomTabParamList) =>
  ({ focused, color, size }: TabIconProps) => {
    const [activeIcon, inactiveIcon] = TAB_ICONS[routeName];
    return (
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={size}
        color={color}
      />
    );
  };

export function BottomTabs() {
  const navigation = useNavigation();

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <FloatingTabBar
        {...props}
        onCenterPress={() => navigation.navigate('Create')}
        centerAccessibilityLabel="Create new item"
      />
    ),
    [navigation],
  );

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      // No headers on tabs; the layout keeps content below the status bar.
      screenLayout={renderSafeAreaLayout}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: renderTabIcon(route.name),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
