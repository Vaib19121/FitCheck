import { Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, useTheme } from '../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

/** Controlled search input; debounce the value with `useDebounce` in the caller. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  style,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={18} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    ...fonts.regular,
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
}));
