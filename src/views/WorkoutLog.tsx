import { useEffect, useMemo, useState, type FocusEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, latestCompletedForExercise, nextSessionIndex } from '../db/dexie';
import { getDay } from '../lib/seed';
import type { DayId, ExerciseLog, SetLog, WorkoutLog } from '../lib/types';
import { Card } from '../components/Card';
import { RestTimer } from '../components/RestTimer';
import { TAB_BAR_HEIGHT_PX } from '../components/Nav';

const SECTION_TITLES: Record<string, string> = {
  warmup: 'Warmup',
  working: 'Working Sets',
  core: 'Core Finisher',
  cardio: 'Cardio',
};

interface LocalSet extends SetLog {
  tempId: string;
}

interface LocalExerciseState {
  sets: LocalSet[];
  skipped: boolean;
  notes: string;
}

function newSet(prev?: LocalSet): LocalSet {
  return {
    tempId: crypto.randomUUID(),
    reps: prev?.reps ?? 0,
    weight: prev?.weight,
    rpe: prev?.rpe,
  };
}

export default function WorkoutLog() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const day = dayId ? getDay(dayId as DayId) : undefined;

  const [state, setState] = useState<Record<string, LocalExerciseState>>({});
  const [restFor, setRestFor] = useState<{ exId: string; seconds: number } | null>(null);

  useEffect(() => {
    if (!day) return;
    const init: Record<string, LocalExerciseState> = {};
    for (const ex of day.exercises) {
      init[ex.id] = {
        sets: [newSet()],
        skipped: false,
        notes: '',
      };
    }
    setState(init);
  }, [day?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!day) {
    return (
      <div className="mt-10 text-center text-muted">
        Unknown day.{' '}
        <Link className="underline" to="/workout">
          Back
        </Link>
      </div>
    );
  }

  const sections = (['warmup', 'working', 'core', 'cardio'] as const)
    .map((s) => ({ key: s, items: day.exercises.filter((e) => e.section === s) }))
    .filter((g) => g.items.length > 0);

  async function complete(status: 'completed' | 'skipped') {
    if (!day) return;
    if (status === 'skipped') {
      if (!confirm('Mark today as skipped?')) return;
      const id = crypto.randomUUID();
      await db.logs.add({
        id,
        dayId: day.id,
        status: 'skipped',
        sessionIndex: null,
        timestamp: Date.now(),
        exerciseLogs: [],
      });
      navigate('/');
      return;
    }

    const exerciseLogs: ExerciseLog[] = day.exercises.map((ex) => {
      const s = state[ex.id];
      const cleanSets: SetLog[] = (s?.sets ?? [])
        .filter((set) => (set.reps ?? 0) > 0 || set.weight !== undefined)
        .map(({ tempId: _tempId, ...rest }) => rest);
      return {
        exerciseId: ex.id,
        sets: s?.skipped ? [] : cleanSets,
        skipped: !!s?.skipped,
        notes: s?.notes || undefined,
      };
    });

    const anyLogged = exerciseLogs.some((e) => !e.skipped && e.sets.length > 0);
    if (!anyLogged && !confirm('No sets recorded. Save anyway?')) return;

    const sessionIndex = await nextSessionIndex(day.id);
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      dayId: day.id,
      status: 'completed',
      sessionIndex,
      timestamp: Date.now(),
      exerciseLogs,
    };
    await db.logs.add(log);
    navigate(`/workout/${day.id}/session/${log.id}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono-eyebrow">{day.abbr} · live</div>
          <h1 className="display-serif mt-2 text-4xl">
            <em>{day.display}</em>
          </h1>
        </div>
        <Link to={`/workout/${day.id}`} className="btn-ghost">
          Cancel
        </Link>
      </header>

      {restFor && (
        <Card className="!p-4">
          <RestTimer
            seconds={restFor.seconds}
            onDone={() => setRestFor(null)}
            label="Rest timer"
          />
        </Card>
      )}

      {sections.map((sec) => (
        <section key={sec.key}>
          <h2 className="mono-eyebrow mb-3">{SECTION_TITLES[sec.key]}</h2>
          <div className="flex flex-col gap-3">
            {sec.items.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                state={state[ex.id]}
                onChange={(s) => setState((prev) => ({ ...prev, [ex.id]: s }))}
                onStartRest={(seconds) => setRestFor({ exId: ex.id, seconds })}
              />
            ))}
          </div>
        </section>
      ))}

      <div
        className="fixed inset-x-0 z-30 border-t border-white/5 bg-ink-950/90 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-3 backdrop-blur"
        style={{
          bottom: `calc(${TAB_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => complete('skipped')}
          >
            Skip today
          </button>
          <button
            type="button"
            className="btn-primary flex-[2]"
            onClick={() => complete('completed')}
          >
            Complete session
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: ReturnType<typeof getDay> extends infer D
    ? D extends { exercises: (infer E)[] }
      ? E
      : never
    : never;
  state?: LocalExerciseState;
  onChange: (s: LocalExerciseState) => void;
  onStartRest: (seconds: number) => void;
}

function ExerciseCard({ exercise, state, onChange, onStartRest }: ExerciseCardProps) {
  const ex = exercise!;
  const prev = useLiveQuery(() => latestCompletedForExercise(ex.id), [ex.id]);
  const s = state ?? { sets: [newSet()], skipped: false, notes: '' };

  const restSeconds = useMemo(() => parseRest(ex.rest), [ex.rest]);

  function updateSet(i: number, patch: Partial<LocalSet>) {
    const sets = s.sets.slice();
    sets[i] = { ...sets[i], ...patch };
    onChange({ ...s, sets });
  }

  function addSet() {
    const last = s.sets[s.sets.length - 1];
    onChange({ ...s, sets: [...s.sets, newSet(last)] });
  }

  function focusToEnd(e: FocusEvent<HTMLInputElement>) {
    const t = e.currentTarget;
    if (t.value && t.type === 'number') {
      // setSelectionRange isn't supported on number inputs in WebKit. Re-set
      // the value to nudge the caret to the end.
      const v = t.value;
      requestAnimationFrame(() => {
        t.value = '';
        t.value = v;
      });
    }
  }

  return (
    <Card className="!p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="font-medium">{ex.name}</div>
          <div className="font-mono text-[11px] text-muted">
            {ex.setsReps ?? ex.prescription}
            {ex.rest ? ` · rest ${ex.rest}` : ''}
          </div>
        </div>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <input
            type="checkbox"
            checked={s.skipped}
            onChange={(e) => onChange({ ...s, skipped: e.target.checked })}
            className="accent-coral"
          />
          skip
        </label>
      </div>

      {ex.notes && (
        <p className="mt-1.5 text-xs text-muted-light">{ex.notes}</p>
      )}

      {prev && (prev.weight != null || prev.reps) && (
        <div className="mt-3 inline-flex items-baseline gap-2 rounded-full border border-coral/30 bg-coral/5 px-3 py-1 font-mono text-[11px]">
          <span className="text-coral">Last time</span>
          <span className="text-white">{formatPrev(prev, ex)}</span>
        </div>
      )}
      {!prev && ex.startingWeight != null && !ex.hideWeight && (
        <div className="mt-3 inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px]">
          <span className="text-muted">Start</span>
          <span className="text-white">{ex.startingWeight} lb</span>
        </div>
      )}

      {!s.skipped && (
        <div className="mt-3 flex flex-col gap-2">
          {s.sets.map((set, i) => (
            <div
              key={set.tempId}
              className="flex items-stretch gap-2 rounded-lg border border-white/5 bg-ink-900 pl-2 pr-2.5"
            >
              <span className="flex w-5 items-center justify-center font-mono text-[11px] text-muted">
                {i + 1}
              </span>
              {!ex.hideWeight && (
                <label
                  className={`flex min-w-0 cursor-text items-center gap-1.5 py-2 ${
                    ex.hideReps ? 'flex-1' : 'flex-1 basis-0'
                  }`}
                >
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder="—"
                    value={set.weight ?? ''}
                    onFocus={focusToEnd}
                    onChange={(e) =>
                      updateSet(i, {
                        weight:
                          e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full min-w-0 bg-transparent text-right font-mono text-base focus:outline-none"
                  />
                  <span className="font-mono text-[11px] text-muted">lb</span>
                </label>
              )}
              {!ex.hideWeight && !ex.hideReps && (
                <span aria-hidden className="flex items-center text-muted">
                  ·
                </span>
              )}
              {!ex.hideReps && (
                <label
                  className={`flex min-w-0 cursor-text items-center gap-1.5 py-2 ${
                    ex.hideWeight ? 'flex-1' : 'flex-1 basis-0'
                  }`}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="—"
                    value={set.reps || ''}
                    onFocus={focusToEnd}
                    onChange={(e) =>
                      updateSet(i, { reps: Number(e.target.value) || 0 })
                    }
                    className="w-full min-w-0 bg-transparent text-right font-mono text-base focus:outline-none"
                  />
                  <span className="font-mono text-[11px] text-muted">reps</span>
                </label>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={addSet} className="btn-ghost !py-1 !text-xs">
              + Add set
            </button>
            {restSeconds > 0 && (
              <button
                type="button"
                onClick={() => onStartRest(restSeconds)}
                className="btn-ghost !py-1 !text-xs"
              >
                Rest {ex.rest}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// Parses "2-3 min" / "60 sec" / "90 sec" / "60-90 sec" into a seconds count
// biased toward the lower bound.
function parseRest(rest?: string): number {
  if (!rest) return 0;
  const m = rest.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(min|sec)/i);
  if (!m) return 0;
  const low = Number(m[1]);
  const unit = m[3].toLowerCase();
  const mult = unit.startsWith('m') ? 60 : 1;
  return low * mult;
}

function formatPrev(
  prev: { weight?: number; reps?: number },
  ex: { hideWeight?: boolean; hideReps?: boolean },
): string {
  const parts: string[] = [];
  if (!ex.hideWeight && prev.weight != null) parts.push(`${prev.weight} lb`);
  if (!ex.hideReps && prev.reps) parts.push(`${prev.reps} reps`);
  return parts.join(' · ');
}
