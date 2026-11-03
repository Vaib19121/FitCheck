import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../components/Button';
import { fonts, makeStyles, spacing } from '../theme';

export function HomeScreen() {
  const styles = useStyles();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.body}>
        Start building here. Tabs live in src/navigation/BottomTabs.tsx; pushed
        screens with a back button live in RootNavigator.tsx.
      </Text>
      <Button
        title="Open details"
        icon="arrow-forward"
        onPress={() => navigation.navigate('Details', { id: '42' })}
      />
    </ScrollView>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...fonts.bold,
    fontSize: 32,
    color: colors.text,
  },
  body: {
    ...fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
}));
