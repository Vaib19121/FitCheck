import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EquipmentGroupKey, equipmentForGroups } from '../data/equipment';
import { WeightUnit } from '../utils/format';
import { zustandStorage } from './storage';

export type Goal = 'strength' | 'muscle' | 'fatLoss' | 'general';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export type Profile = {
  name: string;
  goal: Goal;
  level: Level;
  equipment: EquipmentGroupKey[];
  unit: WeightUnit;
  /** Workouts per week the user is aiming for. */
  weeklyTarget: number;
};

type ProfileState = Profile & {
  onboarded: boolean;
  update: (patch: Partial<Profile>) => void;
  completeOnboarding: (profile: Profile) => void;
  reset: () => void;
};

export const DEFAULT_PROFILE: Profile = {
  name: '',
  goal: 'general',
  level: 'beginner',
  equipment: ['dumbbells'],
  unit: 'kg',
  weeklyTarget: 3,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    set => ({
      ...DEFAULT_PROFILE,
      onboarded: false,
      update: patch => set(patch),
      completeOnboarding: profile => set({ ...profile, onboarded: true }),
      reset: () => set({ ...DEFAULT_PROFILE, onboarded: false }),
    }),
    {
      name: 'profile',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ name, goal, level, equipment, unit, weeklyTarget, onboarded }) => ({
        name,
        goal,
        level,
        equipment,
        unit,
        weeklyTarget,
        onboarded,
      }),
    },
  ),
);

/** Dataset equipment values the user has access to. */
export function useAvailableEquipment() {
  const groups = useProfileStore(s => s.equipment);
  return useMemo(() => equipmentForGroups(groups), [groups]);
}

export const GOAL_LABELS: Record<Goal, string> = {
  strength: 'Get stronger',
  muscle: 'Build muscle',
  fatLoss: 'Lose fat',
  general: 'Stay fit',
};

export const GOAL_ICONS: Record<Goal, string> = {
  strength: 'barbell-outline',
  muscle: 'body-outline',
  fatLoss: 'flame-outline',
  general: 'heart-outline',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const LEVEL_HINTS: Record<Level, string> = {
  beginner: 'New to training or returning after a long break',
  intermediate: 'Training consistently for 6+ months',
  advanced: 'Several years of structured training',
};
