export type BodyPart =
  | 'upper arms'
  | 'upper legs'
  | 'back'
  | 'waist'
  | 'chest'
  | 'shoulders'
  | 'lower legs'
  | 'lower arms'
  | 'cardio'
  | 'neck';

/** Free-form in the dataset (e.g. "body weight", "dumbbell", "cable"). */
export type Equipment = string;

export type Exercise = {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  target: string;
  secondaryMuscles: string[];
  /** Ordered instruction steps keyed by language code (e.g. "en"). */
  steps: Record<string, string[]>;
  /** Relative path to the 180×180 thumbnail in the dataset repo. */
  image: string;
  /** Relative path to the 180×180 animation GIF in the dataset repo. */
  gif: string;
};

export type ExerciseFilter = {
  query?: string;
  bodyPart?: BodyPart | null;
  /** Empty or undefined = any equipment. */
  equipment?: Equipment[];
  target?: string | null;
};
