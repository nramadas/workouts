import type { DayId, WeekdayNum } from './types';

// Day boundary rolls over at 4am local time so late-night workouts count as
// the previous day.
const DAY_BOUNDARY_HOUR = 4;

export function currentDayOfWeek(now = new Date()): WeekdayNum {
  const shifted = new Date(now.getTime());
  if (shifted.getHours() < DAY_BOUNDARY_HOUR) {
    shifted.setDate(shifted.getDate() - 1);
  }
  return shifted.getDay() as WeekdayNum;
}

export function dayWindow(now = new Date()): { start: number; end: number } {
  const shifted = new Date(now.getTime());
  if (shifted.getHours() < DAY_BOUNDARY_HOUR) {
    shifted.setDate(shifted.getDate() - 1);
  }
  const start = new Date(
    shifted.getFullYear(),
    shifted.getMonth(),
    shifted.getDate(),
    DAY_BOUNDARY_HOUR,
    0,
    0,
    0,
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.getTime(), end: end.getTime() };
}

const WEEKDAY_TO_DAY_ID: Record<WeekdayNum, DayId | null> = {
  0: null, // Sunday — rest
  1: 'mon-lower-a',
  2: 'tue-push',
  3: 'wed-pull',
  4: 'thu-lower-b',
  5: 'fri-upper-full',
  6: 'sat-optional',
};

export function dayIdForToday(now = new Date()): DayId | null {
  return WEEKDAY_TO_DAY_ID[currentDayOfWeek(now)];
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function weekdayName(n: WeekdayNum): string {
  return WEEKDAY_NAMES[n];
}
