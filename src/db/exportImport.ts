import { z } from 'zod';
import { db, reassignSessionIndices, SCHEMA_VERSION } from './dexie';
import type { WorkoutLog } from '../lib/types';

const setLogSchema = z.object({
  reps: z.number(),
  weight: z.number().optional(),
  rpe: z.number().optional(),
  notes: z.string().optional(),
});

const exerciseLogSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(setLogSchema),
  skipped: z.boolean(),
  notes: z.string().optional(),
});

const workoutLogSchema = z.object({
  id: z.string(),
  dayId: z.string(),
  status: z.enum(['completed', 'skipped']),
  sessionIndex: z.number().nullable(),
  timestamp: z.number(),
  exerciseLogs: z.array(exerciseLogSchema),
});

const exportSchema = z.object({
  schemaVersion: z.number(),
  logs: z.array(workoutLogSchema),
});

export interface ExportFile {
  schemaVersion: number;
  logs: WorkoutLog[];
}

export async function exportAll(): Promise<ExportFile> {
  const logs = await db.logs.toArray();
  return { schemaVersion: SCHEMA_VERSION, logs };
}

export async function importAll(payload: unknown): Promise<{ imported: number }> {
  const parsed = exportSchema.parse(payload);
  await db.logs.clear();
  await db.logs.bulkPut(parsed.logs as WorkoutLog[]);
  await reassignSessionIndices();
  return { imported: parsed.logs.length };
}
