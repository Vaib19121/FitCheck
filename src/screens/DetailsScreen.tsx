import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { RootStackScreenProps } from '../navigation/types';

export function DetailsScreen({ route }: RootStackScreenProps<'Details'>) {
  return (
    <PlaceholderScreen
      icon="document-text-outline"
      title={`Item ${route.params.id}`}
      subtitle="A pushed stack screen: it keeps the header and back button."
    />
  );
}
