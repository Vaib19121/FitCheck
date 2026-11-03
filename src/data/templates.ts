import { getExercise } from './exercises';
import { Equipment } from './types';

/**
 * Starter routines. Each slot lists exercise ids in order of preference;
 * the first one the user has equipment for is used. Slots with no usable
 * option are skipped.
 */
export type Template = {
  key: string;
  name: string;
  description: string;
  icon: string;
  slots: string[][];
};

export const TEMPLATES: Template[] = [
  {
    key: 'full-body',
    name: 'Full Body',
    description: 'Squat, push, pull, hinge, press and core in one session.',
    icon: 'body-outline',
    slots: [
      ['0043', '1760', '1004', '0514'], // squat
      ['0025', '0289', '0662'], // horizontal push
      ['0027', '0293', '0861', '0499'], // row
      ['0085', '1459', '3013'], // hinge
      ['0426', '1456', '0587', '3662'], // overhead press
      ['0274'], // core
    ],
  },
  {
    key: 'push',
    name: 'Push Day',
    description: 'Chest, shoulders and triceps.',
    icon: 'arrow-up-circle-outline',
    slots: [
      ['0025', '0289', '0662'],
      ['0314', '0577', '0662'],
      ['0426', '1456', '0587', '3662'],
      ['0334'],
      ['0241', '0814'],
    ],
  },
  {
    key: 'pull',
    name: 'Pull Day',
    description: 'Back and biceps.',
    icon: 'arrow-down-circle-outline',
    slots: [
      ['0198', '0652'],
      ['0027', '0293', '0499'],
      ['0861', '0293', '0499'],
      ['0294', '0968'],
    ],
  },
  {
    key: 'legs',
    name: 'Leg Day',
    description: 'Quads, hamstrings, glutes and calves.',
    icon: 'walk-outline',
    slots: [
      ['0043', '1760', '1004', '0514'],
      ['0085', '1459', '3013'],
      ['0739', '0336', '1001', '1460'],
      ['0585'],
      ['0586'],
      ['1372', '0409', '0999'],
    ],
  },
  {
    key: 'hiit',
    name: 'Bodyweight Burn',
    description: 'No equipment, high-rep conditioning circuit.',
    icon: 'flame-outline',
    slots: [['1160'], ['0630'], ['0514'], ['0662'], ['1460'], ['0274']],
  },
];

/** Resolve a template to exercise ids the user can do, without duplicates. */
export function resolveTemplate(
  template: Template,
  available: readonly Equipment[],
): string[] {
  const owned = new Set(available);
  const chosen: string[] = [];
  for (const options of template.slots) {
    const pick = options.find(id => {
      const ex = getExercise(id);
      return ex && owned.has(ex.equipment) && !chosen.includes(id);
    });
    if (pick) {
      chosen.push(pick);
    }
  }
  return chosen;
}
