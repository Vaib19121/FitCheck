import { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { children: ReactElement };

// Pads each edge by its own inset; they can differ (foldables, landscape).
export function SafeAreaLayout({ children }: Props) {
  return (
    <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

/** For navigators' `screenLayout` on screens without a header. */
export const renderSafeAreaLayout = ({ children }: Props) => (
  <SafeAreaLayout>{children}</SafeAreaLayout>
);

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
