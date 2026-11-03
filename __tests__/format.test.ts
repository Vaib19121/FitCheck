import {
  formatClock,
  formatDuration,
  formatRelativeDay,
  formatVolume,
  fromDisplayWeight,
  toDisplayWeight,
} from '../src/utils/format';

describe('format utils', () => {
  it('formats clocks and durations', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatDuration(3725)).toBe('1h 2m');
    expect(formatDuration(300)).toBe('5m');
  });

  it('round-trips kg/lb conversion', () => {
    expect(toDisplayWeight(100, 'kg')).toBe(100);
    expect(toDisplayWeight(100, 'lb')).toBe(220.5);
    expect(toDisplayWeight(fromDisplayWeight(135, 'lb'), 'lb')).toBe(135);
  });

  it('shortens large volumes', () => {
    expect(formatVolume(12500, 'kg')).toBe('12.5k kg');
    expect(formatVolume(950, 'kg')).toBe('950 kg');
  });

  it('formats relative days', () => {
    const now = new Date(2026, 10, 3, 12).getTime();
    expect(formatRelativeDay(new Date(2026, 10, 3, 8), now)).toBe('Today');
    expect(formatRelativeDay(new Date(2026, 10, 2, 23), now)).toBe('Yesterday');
    expect(formatRelativeDay(new Date(2026, 9, 31), now)).toBe('3 days ago');
  });
});
