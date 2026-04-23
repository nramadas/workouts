import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/dexie';
import { Card, Stat } from '../components/Card';
import { dayIdForToday, dayWindow, weekdayName, currentDayOfWeek } from '../lib/day';
import { getDay, mobility } from '../lib/seed';
import type { WorkoutLog } from '../lib/types';

export default function Dashboard() {
  const logs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().toArray(), [], [] as WorkoutLog[]);

  const dayId = dayIdForToday();
  const day = dayId ? getDay(dayId) : undefined;
  const weekday = currentDayOfWeek();
  const dayName = weekdayName(weekday);

  const { start: dayStart, end: dayEnd } = dayWindow();
  const todayLog = logs.find((l) => l.timestamp >= dayStart && l.timestamp < dayEnd);

  const completedLogs = logs.filter((l) => l.status === 'completed');
  const totalWorkouts = completedLogs.length;
  const totalSets = completedLogs.reduce(
    (sum, l) =>
      sum +
      l.exerciseLogs
        .filter((e) => !e.skipped)
        .reduce((s, e) => s + e.sets.length, 0),
    0,
  );

  let heaviest: { weight: number; name: string } | null = null;
  const prBook: Record<string, { weight: number; name: string; ts: number }> = {};
  for (const log of [...completedLogs].sort((a, b) => a.timestamp - b.timestamp)) {
    for (const entry of log.exerciseLogs) {
      if (entry.skipped) continue;
      for (const set of entry.sets) {
        if (set.weight === undefined) continue;
        const prev = prBook[entry.exerciseId];
        if (!prev || set.weight > prev.weight) {
          prBook[entry.exerciseId] = {
            weight: set.weight,
            name:
              exerciseNameIndex[entry.exerciseId] ??
              entry.exerciseId,
            ts: log.timestamp,
          };
        }
        if (!heaviest || set.weight > heaviest.weight) {
          heaviest = {
            weight: set.weight,
            name:
              exerciseNameIndex[entry.exerciseId] ??
              entry.exerciseId,
          };
        }
      }
    }
  }

  const recentPRs = Object.values(prBook)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 3);

  const recent = completedLogs.slice(0, 4);

  const mobilityToday = mobility.sessions.find((s) => s.day === dayName);

  return (
    <div className="flex flex-col gap-6">
      <Card ambient crosshair>
        <div className="mono-eyebrow">Today</div>
        <h1 className="display-serif mt-2 text-4xl sm:text-5xl">
          Hey — <em>{day ? day.display : dayName}</em>{' '}
          <span className="text-white/60">
            {day ? 'today' : 'rest day'}
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-light">
          {day
            ? 'Warmups, working sets, and finishers below. Beat last session.'
            : 'No lift scheduled. Keep the mobility habit.'}
        </p>

        {day && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {todayLog?.status === 'completed' ? (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-sm text-emerald-300">
                Completed · session #{todayLog.sessionIndex}
              </span>
            ) : todayLog?.status === 'skipped' ? (
              <SkipBanner log={todayLog} />
            ) : (
              <>
                <Link className="btn-primary" to={`/workout/${day.id}/log`}>
                  Start {day.display}
                </Link>
                <Link className="btn-ghost" to={`/workout/${day.id}`}>
                  View plan
                </Link>
                <SkipTodayButton dayId={day.id} />
              </>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2 sm:gap-5">
        <Card className="min-w-0 overflow-hidden !p-3 sm:!p-5">
          <Stat value={totalWorkouts} label="Workouts" />
        </Card>
        <Card className="min-w-0 overflow-hidden !p-3 sm:!p-5">
          <Stat value={totalSets} label="Sets" />
        </Card>
        <Card className="min-w-0 overflow-hidden !p-3 sm:!p-5">
          <Stat
            value={heaviest ? `${heaviest.weight}` : '—'}
            label="Top lb"
            sub={heaviest?.name}
          />
        </Card>
      </div>

      {mobilityToday && (
        <Card crosshair>
          <div className="mono-eyebrow">Tonight · mobility</div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="display-serif text-2xl">{mobilityToday.title}</div>
              <div className="mt-1 text-sm text-muted-light">{mobilityToday.meta}</div>
            </div>
            <Link className="btn-ghost" to="/mobility">
              Open
            </Link>
          </div>
        </Card>
      )}

      <section>
        <h2 className="display-serif mb-3 text-2xl">
          Recent <em>activity</em>
        </h2>
        {recent.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-light">Nothing logged yet. Your first session starts the book.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((l) => (
              <li key={l.id}>
                <Card className="!p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {dayLabel(l.dayId)}{' '}
                        <span className="text-muted-light">· session #{l.sessionIndex}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-light">
                        {summariseLog(l)}
                      </div>
                    </div>
                    <Link
                      to={`/workout/${l.dayId}`}
                      className="text-xs text-coral hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentPRs.length > 0 && (
        <section>
          <h2 className="display-serif mb-3 text-2xl">
            Recent <em>PRs</em>
          </h2>
          <ul className="flex flex-col gap-2">
            {recentPRs.map((pr, i) => (
              <li key={i}>
                <Card className="!p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm">{pr.name}</div>
                    <div className="stat-num text-xl">
                      {pr.weight}
                      <span className="ml-1 text-xs text-muted-light">lb</span>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SkipBanner({ log }: { log: WorkoutLog }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-light">
        ↷ Skipped today
      </span>
      <button
        type="button"
        className="btn-ghost !py-1 !text-xs"
        onClick={async () => {
          await db.logs.delete(log.id);
        }}
      >
        Undo
      </button>
    </div>
  );
}

function SkipTodayButton({ dayId }: { dayId: string }) {
  async function skip() {
    if (!confirm('Skip today? You can undo from the dashboard.')) return;
    const id = crypto.randomUUID();
    await db.logs.add({
      id,
      dayId: dayId as WorkoutLog['dayId'],
      status: 'skipped',
      sessionIndex: null,
      timestamp: Date.now(),
      exerciseLogs: [],
    });
  }
  return (
    <button className="btn-ghost" type="button" onClick={skip}>
      Skip today
    </button>
  );
}

// Build a fast name index so logs can be prettified without extra lookups.
import { allExercises } from '../lib/seed';
const exerciseNameIndex: Record<string, string> = Object.fromEntries(
  allExercises().map((e) => [e.id, e.name]),
);

function dayLabel(dayId: string) {
  return getDay(dayId as WorkoutLog['dayId'])?.display ?? dayId;
}

function summariseLog(log: WorkoutLog): string {
  let volume = 0;
  let heaviest = 0;
  for (const e of log.exerciseLogs) {
    if (e.skipped) continue;
    for (const s of e.sets) {
      const w = s.weight ?? 0;
      volume += w * s.reps;
      if (w > heaviest) heaviest = w;
    }
  }
  if (heaviest === 0) return 'no weights logged';
  return `volume ${Math.round(volume).toLocaleString()} lb · top ${heaviest} lb`;
}
