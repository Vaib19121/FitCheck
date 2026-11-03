import {
  exercises,
  getExercise,
  mediaUrl,
  searchExercises,
} from '../src/data/exercises';

describe('exercise catalog', () => {
  it('loads the full dataset', () => {
    expect(exercises).toHaveLength(1324);
    expect(getExercise('0001')?.name).toBe('3/4 Sit-Up');
  });

  it('filters by body part and equipment', () => {
    const result = searchExercises({ bodyPart: 'chest', equipment: ['dumbbell'] });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(e => e.bodyPart === 'chest' && e.equipment === 'dumbbell'),
    ).toBe(true);
  });

  it('matches every search term', () => {
    const result = searchExercises({ query: 'barbell bench' });
    expect(result.some(e => e.name === 'Barbell Bench Press')).toBe(true);
    expect(
      result.every(e => /barbell/i.test(`${e.name} ${e.equipment}`)),
    ).toBe(true);
  });

  it('builds pinned CDN media URLs', () => {
    expect(mediaUrl('videos/0001-2gPfomN.gif')).toMatch(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/hasaneyldrm\/exercises-dataset@[0-9a-f]{40}\/videos\//,
    );
  });
});
