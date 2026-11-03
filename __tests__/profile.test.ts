import { ALL_EQUIPMENT_GROUPS, equipmentForGroups } from '../src/data/equipment';
import { equipmentOptions } from '../src/data/exercises';
import { DEFAULT_PROFILE, useProfileStore } from '../src/store/profileStore';

describe('equipment groups', () => {
  it('always includes body weight', () => {
    expect(equipmentForGroups([])).toEqual(['body weight']);
  });

  it('covers every equipment value in the dataset', () => {
    const covered = new Set(equipmentForGroups(ALL_EQUIPMENT_GROUPS));
    expect(equipmentOptions.filter(e => !covered.has(e))).toEqual([]);
  });
});

describe('profile store', () => {
  it('completes onboarding and resets', () => {
    const { completeOnboarding } = useProfileStore.getState();
    completeOnboarding({ ...DEFAULT_PROFILE, name: 'Sam', unit: 'lb' });
    expect(useProfileStore.getState()).toMatchObject({
      name: 'Sam',
      unit: 'lb',
      onboarded: true,
    });

    useProfileStore.getState().reset();
    expect(useProfileStore.getState()).toMatchObject({
      name: '',
      onboarded: false,
    });
  });
});
