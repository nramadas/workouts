import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useParams } from 'react-router-dom';
import { db, reassignSessionIndices } from '../db/dexie';
import { Card } from '../components/Card';
import { allExercises, getDay } from '../lib/seed';
import type { DayId } from '../lib/types';

export default function WorkoutSession() {
  const { dayId, sessionId } = useParams<{ dayId: string; sessionId: string }>();
  const log = useLiveQuery(() => (sessionId ? db.logs.get(sessionId) : undefined), [sessionId]);
  const day = dayId ? getDay(dayId as DayId) : undefined;

  if (!log || !day) {
    return (
      <div className="mt-10 text-center text-muted">
        Session not found.{' '}
        <Link to="/workout" className="underline">
          Back
        </Link>
      </div>
    );
  }

  const exerciseById = Object.fromEntries(allExercises().map((e) => [e.id, e]));

  let volume = 0;
  let heaviest = 0;
  let sets = 0;
  for (const e of log.exerciseLogs) {
    if (e.skipped) continue;
    sets += e.sets.length;
    for (const s of e.sets) {
      volume += (s.weight ?? 0) * s.reps;
      if ((s.weight ?? 0) > heaviest) heaviest = s.weight!;
    }
  }

  async function onDelete() {
    if (!log) return;
    if (!confirm('Delete this session? Session numbers for this day will re-sequence.')) return;
    await db.logs.delete(log.id);
    await reassignSessionIndices();
    history.back();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono-eyebrow">
            {day.abbr} · session #{log.sessionIndex}
          </div>
          <h1 className="display-serif mt-2 text-4xl">
            <em>{day.display}</em>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/workout/${day.id}`} className="btn-ghost">
            Back
          </Link>
          <button type="button" className="btn-ghost" onClick={onDelete}>
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4">
          <div className="stat-num text-2xl">{sets}</div>
          <div className="mono-eyebrow mt-1">Sets</div>
        </Card>
        <Card className="!p-4">
          <div className="stat-num text-2xl">{heaviest || '—'}</div>
          <div className="mono-eyebrow mt-1">Top lb</div>
        </Card>
        <Card className="!p-4">
          <div className="stat-num text-2xl">{Math.round(volume).toLocaleString()}</div>
          <div className="mono-eyebrow mt-1">Volume</div>
        </Card>
      </div>

      <Card className="!p-0" crosshair>
        <ul className="divide-y divide-white/5">
          {log.exerciseLogs.map((entry) => {
            const ex = exerciseById[entry.exerciseId];
            if (!ex) return null;
            return (
              <li key={entry.exerciseId} className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-medium">{ex.name}</div>
                  {entry.skipped && (
                    <span className="font-mono text-[11px] text-muted">skipped</span>
                  )}
                </div>
                {!entry.skipped && entry.sets.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {entry.sets.map((s, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-white/5 bg-ink-900 px-2 py-1 font-mono text-[11px]"
                      >
                        {s.weight ?? '—'} × {s.reps}
                      </li>
                    ))}
                  </ul>
                )}
                {!entry.skipped && entry.sets.length === 0 && (
                  <p className="mt-1 text-xs text-muted">no sets logged</p>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
