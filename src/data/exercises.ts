import rawExercises from './exercises.json';
import meta from './meta.json';
import { BodyPart, Exercise, ExerciseFilter } from './types';

export type { BodyPart, Equipment, Exercise, ExerciseFilter } from './types';

/** Required wherever exercise media is shown (Gym visual media terms). */
export const MEDIA_ATTRIBUTION = '© Gym visual — https://gymvisual.com/';

const MEDIA_BASE = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@${meta.sha}/`;

export const exercises = rawExercises as Exercise[];

const byId = new Map(exercises.map(e => [e.id, e]));

export const bodyParts = meta.bodyParts.map(b => b.value as BodyPart);
export const equipmentOptions = meta.equipment.map(e => e.value);
export const targets = meta.targets.map(t => t.value);

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id);
}

export function mediaUrl(path: string) {
  return MEDIA_BASE + path;
}

export function exerciseSteps(exercise: Exercise, lang = 'en') {
  return exercise.steps[lang] ?? exercise.steps.en ?? [];
}

/** Case-insensitive search over name/target/equipment, plus exact facet filters. */
export function searchExercises({
  query,
  bodyPart,
  equipment,
  target,
}: ExerciseFilter): Exercise[] {
  const terms = (query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const equipmentSet = equipment?.length ? new Set(equipment) : null;

  return exercises.filter(e => {
    if (bodyPart && e.bodyPart !== bodyPart) {
      return false;
    }
    if (equipmentSet && !equipmentSet.has(e.equipment)) {
      return false;
    }
    if (target && e.target !== target) {
      return false;
    }
    if (terms.length) {
      const haystack =
        `${e.name} ${e.target} ${e.equipment} ${e.bodyPart}`.toLowerCase();
      return terms.every(t => haystack.includes(t));
    }
    return true;
  });
}
