export type DayId =
  | 'mon-lower-a'
  | 'tue-push'
  | 'wed-pull'
  | 'thu-lower-b'
  | 'fri-upper-full'
  | 'sat-optional';

export type Section = 'warmup' | 'working' | 'core' | 'cardio';

export interface Exercise {
  id: string;
  dayId: DayId;
  section: Section;
  orderIndex: number;
  name: string;
  prescription?: string;
  setsReps?: string;
  rest?: string;
  notes?: string;
  startingWeight?: number | null;
  muscleGroups?: string[];
  hideWeight?: boolean;
  hideReps?: boolean;
}

export interface DayDef {
  id: DayId;
  display: string;
  abbr: string;
  exercises: Exercise[];
}

export interface SetLog {
  reps: number;
  weight?: number;
  rpe?: number;
  notes?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  skipped: boolean;
  notes?: string;
}

export type WorkoutStatus = 'completed' | 'skipped';

export interface WorkoutLog {
  id: string;
  dayId: DayId;
  status: WorkoutStatus;
  sessionIndex: number | null;
  timestamp: number;
  exerciseLogs: ExerciseLog[];
}

export interface Settings {
  schemaVersion: number;
}

export type WeekdayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
