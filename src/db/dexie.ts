import Dexie, { type Table } from 'dexie';
import type { WorkoutLog } from '../lib/types';

export const SCHEMA_VERSION = 1;

interface SettingsRow {
  key: string;
  value: unknown;
}

class WorkoutsDB extends Dexie {
  logs!: Table<WorkoutLog, string>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super('workouts');
    this.version(1).stores({
      logs: 'id, dayId, timestamp, [dayId+timestamp], status',
      settings: 'key',
    });
  }
}

export const db = new WorkoutsDB();

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key);
  return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown) {
  await db.settings.put({ key, value });
}

export async function nextSessionIndex(dayId: string): Promise<number> {
  const completed = await db.logs
    .where('[dayId+timestamp]')
    .between([dayId, Dexie.minKey], [dayId, Dexie.maxKey])
    .filter((l) => l.status === 'completed')
    .count();
  return completed + 1;
}

export async function latestCompletedForExercise(
  exerciseId: string,
): Promise<{ log: WorkoutLog; weight?: number; reps?: number } | null> {
  const all = await db.logs
    .orderBy('timestamp')
    .reverse()
    .filter((l) => l.status === 'completed')
    .toArray();
  for (const log of all) {
    const entry = log.exerciseLogs.find((e) => e.exerciseId === exerciseId && !e.skipped);
    if (entry && entry.sets.length > 0) {
      const topSet = entry.sets.reduce(
        (best, s) => (s.weight !== undefined && (best === null || (s.weight ?? 0) >= (best.weight ?? 0)) ? s : best),
        null as null | typeof entry.sets[number],
      );
      const fallback = entry.sets[entry.sets.length - 1];
      const chosen = topSet ?? fallback;
      return { log, weight: chosen.weight, reps: chosen.reps };
    }
  }
  return null;
}

export async function reassignSessionIndices() {
  const logs = await db.logs.orderBy('timestamp').toArray();
  const counters: Record<string, number> = {};
  for (const log of logs) {
    if (log.status === 'completed') {
      counters[log.dayId] = (counters[log.dayId] ?? 0) + 1;
      log.sessionIndex = counters[log.dayId];
    } else {
      log.sessionIndex = null;
    }
  }
  await db.logs.bulkPut(logs);
}

export async function wipeAll() {
  await db.logs.clear();
  await db.settings.clear();
}
