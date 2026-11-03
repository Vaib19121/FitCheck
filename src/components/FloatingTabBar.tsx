import { Pressable, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, useTheme } from '../theme';

type FloatingTabBarProps = BottomTabBarProps & {
  /** When set, a raised "+" button sits between the two halves of the tabs. */
  onCenterPress?: () => void;
  centerAccessibilityLabel?: string;
};

const CENTER_SIZE = 56;

/** Floating pill tab bar with an optional raised action button in the middle. */
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  onCenterPress,
  centerAccessibilityLabel = 'Create',
}: FloatingTabBarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  // Insets can differ per edge, so pad each side independently.
  const insets = useSafeAreaInsets();

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const color = focused ? colors.primary : colors.textTertiary;
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : options.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        onLongPress={() =>
          navigation.emit({ type: 'tabLongPress', target: route.key })
        }
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
        style={styles.tab}
      >
        {options.tabBarIcon?.({ focused, color, size: 22 })}
        <Text
          numberOfLines={1}
          style={[styles.label, focused && styles.labelActive, { color }]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const half = Math.ceil(state.routes.length / 2);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
        },
      ]}
    >
      <View style={styles.pill}>
        {state.routes.slice(0, half).map((r, i) => renderTab(r, i))}
        {onCenterPress ? (
          <View style={styles.centerSlot}>
            <Pressable
              onPress={onCenterPress}
              accessibilityRole="button"
              accessibilityLabel={centerAccessibilityLabel}
              style={({ pressed }) => [
                styles.centerButton,
                pressed && styles.centerButtonPressed,
              ]}
            >
              <Ionicons name="add" size={30} color={colors.onPrimary} />
            </Pressable>
          </View>
        ) : null}
        {state.routes.slice(half).map((r, i) => renderTab(r, i + half))}
      </View>
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  container: {
    backgroundColor: colors.background,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0E1B33',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    ...fonts.medium,
    fontSize: 11,
  },
  labelActive: {
    ...fonts.semiBold,
  },
  centerSlot: {
    width: CENTER_SIZE + 16,
    alignItems: 'center',
  },
  centerButton: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centerButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
}));
