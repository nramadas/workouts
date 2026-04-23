import rawWorkouts from '../data/workouts.json';
import rawMobility from '../data/mobility.json';
import type { DayDef, DayId, Exercise, Section } from './types';

interface RawWorkouts {
  days: Array<{
    id: DayId;
    display: string;
    abbr: string;
    exercises: Array<
      Omit<Exercise, 'section'> & { section: Section; startingWeight?: number | null }
    >;
  }>;
  muscleGroups: Array<{ name: string; setsPerWeek: string; frequency: string }>;
  warmupRules: Array<{ rule: string; detail: string }>;
  executionReminders: Array<{ rule: string; detail: string }>;
}

// Best-effort mapping from exercise name keywords to muscle groups using the
// Reference sheet's vocabulary.
const KEYWORD_MUSCLE: Array<{ kw: RegExp; groups: string[] }> = [
  { kw: /squat|leg press|lunge|bulgarian split/i, groups: ['Quads', 'Glutes'] },
  { kw: /\bRDL|romanian deadlift|deadlift/i, groups: ['Hamstrings', 'Glutes'] },
  { kw: /leg curl/i, groups: ['Hamstrings'] },
  { kw: /hip thrust|glute bridge/i, groups: ['Glutes'] },
  { kw: /hip abduct/i, groups: ['Glutes'] },
  { kw: /calf raise/i, groups: ['Calves'] },
  { kw: /bench press|dumbbell bench|dips|incline/i, groups: ['Chest'] },
  { kw: /overhead press|shoulder press|lateral raise/i, groups: ['Shoulders'] },
  { kw: /pull-up|pulldown|row|face pull/i, groups: ['Back'] },
  { kw: /curl/i, groups: ['Biceps'] },
  { kw: /tricep|pushdown|overhead tricep/i, groups: ['Triceps'] },
  { kw: /shrug|farmer/i, groups: ['Traps / Grip'] },
  { kw: /leg raise|rollout|plank|pallof|woodchop/i, groups: ['Core'] },
];

function inferMuscleGroups(name: string): string[] {
  const hits = new Set<string>();
  for (const { kw, groups } of KEYWORD_MUSCLE) {
    if (kw.test(name)) groups.forEach((g) => hits.add(g));
  }
  return [...hits];
}

function hydrateDay(d: RawWorkouts['days'][number]): DayDef {
  return {
    id: d.id,
    display: d.display,
    abbr: d.abbr,
    exercises: d.exercises.map((e) => ({
      ...e,
      muscleGroups: inferMuscleGroups(e.name),
    })),
  };
}

export const workouts = {
  days: (rawWorkouts as RawWorkouts).days.map(hydrateDay),
  muscleGroups: (rawWorkouts as RawWorkouts).muscleGroups,
  warmupRules: (rawWorkouts as RawWorkouts).warmupRules,
  executionReminders: (rawWorkouts as RawWorkouts).executionReminders,
};

export const DAY_IDS: DayId[] = workouts.days.map((d) => d.id);

export function getDay(id: DayId): DayDef | undefined {
  return workouts.days.find((d) => d.id === id);
}

export function allExercises(): Exercise[] {
  return workouts.days.flatMap((d) => d.exercises);
}

export function getExercise(id: string): Exercise | undefined {
  return allExercises().find((e) => e.id === id);
}

// ─── Mobility ──────────────────────────────────────────────────────────────
export interface MobilityWeekCell {
  day: string;
  abbr: string;
  intensity: 'gentle' | 'moderate' | 'hard';
  focus: string;
}
export interface MobilitySessionExercise {
  name: string;
  dose: string;
  ref: string | null;
}
export interface MobilitySession {
  day: string;
  title: string;
  meta: string;
  note: string;
  exercises: MobilitySessionExercise[];
}
export interface MobilityLibrarySection {
  label: string;
  content: string;
}
export interface MobilityLibraryItem {
  id: string;
  title: string;
  target: string | null;
  dose: string | null;
  sections: MobilityLibrarySection[];
  youtube: string | null;
}
export interface MobilityRule {
  num: string;
  title: string;
  text: string;
}
export interface MobilityBenchmark {
  metric: string;
  desc: string;
}
export interface MobilityAnkleNote {
  title: string;
  paragraphs: string[];
  items: string[];
}
export interface MobilitySeed {
  weeklyGrid: MobilityWeekCell[];
  sessions: MobilitySession[];
  library: MobilityLibraryItem[];
  progressionRules: MobilityRule[];
  benchmarks: MobilityBenchmark[];
  ankleNote: MobilityAnkleNote;
}

export const mobility = rawMobility as unknown as MobilitySeed;
