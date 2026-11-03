import { ReactElement, useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { EmptyState } from './EmptyState';
import { ExerciseRow } from './ExerciseRow';
import { FilterChips } from './Chip';
import { SearchBar } from './SearchBar';
import { EQUIPMENT_GROUPS } from '../data/equipment';
import {
  BodyPart,
  Exercise,
  bodyParts,
  searchExercises,
} from '../data/exercises';
import { useDebounce } from '../hooks/useDebounce';
import { useAvailableEquipment } from '../store/profileStore';
import { fonts, makeStyles, spacing } from '../theme';
import { titleCase } from '../utils/format';

/** "mine" = the user's equipment from their profile; "any" = no filter. */
type EquipmentFilter = 'mine' | 'any' | 'bodyweight' | (typeof EQUIPMENT_GROUPS)[number]['key'];

const EQUIPMENT_FILTERS: { value: EquipmentFilter; label: string }[] = [
  { value: 'mine', label: 'My equipment' },
  { value: 'any', label: 'Any equipment' },
  { value: 'bodyweight', label: 'Body weight' },
  ...EQUIPMENT_GROUPS.map(g => ({ value: g.key, label: g.label })),
];

const BODY_PART_OPTIONS = bodyParts.map(b => ({ value: b, label: titleCase(b) }));

type Props = {
  onPressExercise: (exercise: Exercise) => void;
  /** Picker mode: rows show a checkbox reflecting this set. */
  selectedIds?: ReadonlySet<string>;
  /** Rendered above the search bar (e.g. a screen title). */
  header?: ReactElement;
};

/** Searchable, filterable list of all exercises. Used by Explore and the exercise picker. */
export function ExerciseBrowser({ onPressExercise, selectedIds, header }: Props) {
  const styles = useStyles();
  const myEquipment = useAvailableEquipment();
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null);
  const [equipment, setEquipment] = useState<EquipmentFilter>('mine');
  const debouncedQuery = useDebounce(query, 200);

  const results = useMemo(() => {
    let equipmentValues: string[] | undefined;
    if (equipment === 'mine') {
      equipmentValues = myEquipment;
    } else if (equipment === 'bodyweight') {
      equipmentValues = ['body weight'];
    } else if (equipment !== 'any') {
      equipmentValues = [
        ...(EQUIPMENT_GROUPS.find(g => g.key === equipment)?.values ?? []),
      ];
    }
    return searchExercises({
      query: debouncedQuery,
      bodyPart,
      equipment: equipmentValues,
    });
  }, [debouncedQuery, bodyPart, equipment, myEquipment]);

  const selectable = selectedIds !== undefined;

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseRow
        exercise={item}
        onPress={onPressExercise}
        selectable={selectable}
        selected={selectedIds?.has(item.id)}
      />
    ),
    [onPressExercise, selectable, selectedIds],
  );

  const clearFilters = () => {
    setQuery('');
    setBodyPart(null);
    setEquipment('any');
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        {header}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises, muscles, equipment"
          style={styles.search}
        />
        <FilterChips
          options={BODY_PART_OPTIONS}
          selected={bodyPart}
          onChange={setBodyPart}
          allLabel="All body parts"
        />
        <FilterChips
          options={EQUIPMENT_FILTERS}
          selected={equipment}
          onChange={v => setEquipment(v ?? 'any')}
          allLabel=""
        />
        <Text style={styles.count}>
          {results.length.toLocaleString()}{' '}
          {results.length === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>
      <FlashList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedIds}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No exercises found"
            message="Try a different search or loosen the filters."
            actionTitle="Clear filters"
            onAction={clearFilters}
          />
        }
      />
    </View>
  );
}

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

const useStyles = makeStyles(colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  search: {
    marginHorizontal: spacing.md,
  },
  count: {
    ...fonts.medium,
    fontSize: 13,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
  },
  separator: {
    height: 1,
    marginLeft: spacing.md + 56 + 12,
    backgroundColor: colors.border,
  },
}));
