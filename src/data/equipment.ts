import { Equipment } from './types';

/**
 * User-facing equipment groups mapped to the dataset's raw `equipment` values.
 * Body weight is always available, so it has no group.
 */
export const EQUIPMENT_GROUPS = [
  { key: 'dumbbells', label: 'Dumbbells', icon: 'barbell-outline', values: ['dumbbell'] },
  {
    key: 'barbell',
    label: 'Barbell & plates',
    icon: 'barbell',
    values: ['barbell', 'ez barbell', 'olympic barbell', 'trap bar', 'weighted'],
  },
  { key: 'kettlebell', label: 'Kettlebell', icon: 'fitness-outline', values: ['kettlebell'] },
  { key: 'bands', label: 'Resistance bands', icon: 'git-commit-outline', values: ['band', 'resistance band'] },
  { key: 'cable', label: 'Cable machine', icon: 'git-pull-request-outline', values: ['cable', 'rope'] },
  {
    key: 'machines',
    label: 'Gym machines',
    icon: 'cog-outline',
    values: ['leverage machine', 'smith machine', 'sled machine', 'assisted'],
  },
  {
    key: 'balls',
    label: 'Balls & rollers',
    icon: 'basketball-outline',
    values: ['stability ball', 'medicine ball', 'bosu ball', 'roller', 'wheel roller'],
  },
  {
    key: 'cardio',
    label: 'Cardio machines',
    icon: 'bicycle-outline',
    values: [
      'stationary bike',
      'elliptical machine',
      'stepmill machine',
      'skierg machine',
      'upper body ergometer',
    ],
  },
  { key: 'other', label: 'Other (tire, hammer)', icon: 'hammer-outline', values: ['tire', 'hammer'] },
] as const;

export type EquipmentGroupKey = (typeof EQUIPMENT_GROUPS)[number]['key'];

export const ALL_EQUIPMENT_GROUPS = EQUIPMENT_GROUPS.map(g => g.key);

export const EQUIPMENT_PRESETS: {
  label: string;
  groups: EquipmentGroupKey[];
}[] = [
  { label: 'Bodyweight only', groups: [] },
  { label: 'Home basics', groups: ['dumbbells', 'bands', 'kettlebell'] },
  { label: 'Full gym', groups: ALL_EQUIPMENT_GROUPS },
];

/** Dataset equipment values available for the chosen groups (always incl. body weight). */
export function equipmentForGroups(groups: readonly EquipmentGroupKey[]): Equipment[] {
  const selected = new Set(groups);
  return [
    'body weight',
    ...EQUIPMENT_GROUPS.filter(g => selected.has(g.key)).flatMap(g => g.values),
  ];
}
